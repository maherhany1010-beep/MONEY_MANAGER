-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE card_type AS ENUM ('visa', 'mastercard', 'amex', 'other');
CREATE TYPE transaction_type AS ENUM ('withdrawal', 'deposit', 'payment', 'cashback');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'overdue');

-- Create credit_cards table
CREATE TABLE IF NOT EXISTS credit_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    card_number_last_four VARCHAR(4) NOT NULL,
    card_type card_type NOT NULL DEFAULT 'other',
    credit_limit DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    cashback_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    due_date INTEGER NOT NULL CHECK (due_date >= 1 AND due_date <= 31),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE NOT NULL,
    type transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES credit_cards(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_credit_cards_user_id ON credit_cards(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_card_id ON transactions(card_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_card_id ON payments(card_id);
CREATE INDEX idx_payments_due_date ON payments(due_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_credit_cards_updated_at 
    BEFORE UPDATE ON credit_cards 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for credit_cards
CREATE POLICY "Users can view their own credit cards" ON credit_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit cards" ON credit_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit cards" ON credit_cards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit cards" ON credit_cards
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for payments
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON payments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" ON payments
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update card balance after transaction
CREATE OR REPLACE FUNCTION update_card_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update card balance based on transaction type
        IF NEW.type = 'withdrawal' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance + NEW.amount
            WHERE id = NEW.card_id;
        ELSIF NEW.type = 'payment' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance - NEW.amount
            WHERE id = NEW.card_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Reverse the balance update when transaction is deleted
        IF OLD.type = 'withdrawal' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance - OLD.amount
            WHERE id = OLD.card_id;
        ELSIF OLD.type = 'payment' THEN
            UPDATE credit_cards 
            SET current_balance = current_balance + OLD.amount
            WHERE id = OLD.card_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic balance updates
CREATE TRIGGER update_card_balance_trigger
    AFTER INSERT OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_card_balance();

-- Create function to calculate monthly cashback
CREATE OR REPLACE FUNCTION calculate_monthly_cashback(
    p_user_id UUID,
    p_card_id UUID DEFAULT NULL,
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM NOW()),
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())
)
RETURNS TABLE (
    card_id UUID,
    card_name VARCHAR,
    total_spent DECIMAL,
    cashback_earned DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as card_id,
        c.name as card_name,
        COALESCE(SUM(t.amount), 0) as total_spent,
        COALESCE(SUM(t.amount * c.cashback_rate / 100), 0) as cashback_earned
    FROM credit_cards c
    LEFT JOIN transactions t ON c.id = t.card_id 
        AND t.type = 'withdrawal'
        AND EXTRACT(MONTH FROM t.transaction_date) = p_month
        AND EXTRACT(YEAR FROM t.transaction_date) = p_year
    WHERE c.user_id = p_user_id
        AND (p_card_id IS NULL OR c.id = p_card_id)
    GROUP BY c.id, c.name
    ORDER BY cashback_earned DESC;
END;
$$ LANGUAGE plpgsql;
