/**
 * 🚀 Script لتحديث جميع Contexts للاتصال بـ Supabase
 * 
 * الاستخدام:
 * node scripts/update-contexts.js
 */

const fs = require('fs');
const path = require('path');

// ===================================
// 📋 قائمة الـ Contexts المطلوب تحديثها
// ===================================
const contextsToUpdate = [
  {
    file: 'prepaid-cards-context.tsx',
    tableName: 'prepaid_cards',
    interfaceName: 'PrepaidCard',
    contextName: 'PrepaidCards',
    hookName: 'usePrepaidCards',
    itemsName: 'cards',
    fields: {
      card_name: 'string',
      card_number: 'string | null',
      balance: 'number',
      currency: 'string',
      expiry_date: 'string | null',
      status: 'string',
    }
  },
  {
    file: 'customers-context.tsx',
    tableName: 'customers',
    interfaceName: 'Customer',
    contextName: 'Customers',
    hookName: 'useCustomers',
    itemsName: 'customers',
    fields: {
      name: 'string',
      phone: 'string | null',
      email: 'string | null',
      address: 'string | null',
      notes: 'string | null',
    }
  },
  {
    file: 'products-context.tsx',
    tableName: 'products',
    interfaceName: 'Product',
    contextName: 'Products',
    hookName: 'useProducts',
    itemsName: 'products',
    fields: {
      name: 'string',
      description: 'string | null',
      price: 'number',
      cost: 'number | null',
      stock_quantity: 'number',
      category: 'string | null',
    }
  },
  {
    file: 'pos-machines-context.tsx',
    tableName: 'pos_machines',
    interfaceName: 'POSMachine',
    contextName: 'POSMachines',
    hookName: 'usePOSMachines',
    itemsName: 'machines',
    fields: {
      machine_name: 'string',
      machine_number: 'string | null',
      provider: 'string | null',
      commission_rate: 'number | null',
      status: 'string',
    }
  },
  {
    file: 'savings-circles-context.tsx',
    tableName: 'savings_circles',
    interfaceName: 'SavingsCircle',
    contextName: 'SavingsCircles',
    hookName: 'useSavingsCircles',
    itemsName: 'circles',
    fields: {
      circle_name: 'string',
      total_amount: 'number',
      monthly_payment: 'number',
      start_date: 'string',
      end_date: 'string | null',
      status: 'string',
    }
  },
  {
    file: 'investments-context.tsx',
    tableName: 'investments',
    interfaceName: 'Investment',
    contextName: 'Investments',
    hookName: 'useInvestments',
    itemsName: 'investments',
    fields: {
      investment_name: 'string',
      investment_type: 'string | null',
      initial_amount: 'number',
      current_value: 'number | null',
      start_date: 'string',
      status: 'string',
    }
  },
  {
    file: 'merchants-context.tsx',
    tableName: 'merchants',
    interfaceName: 'Merchant',
    contextName: 'Merchants',
    hookName: 'useMerchants',
    itemsName: 'merchants',
    fields: {
      merchant_name: 'string',
      category: 'string | null',
      contact_info: 'string | null',
    }
  },
  {
    file: 'central-transfers-context.tsx',
    tableName: 'central_transfers',
    interfaceName: 'CentralTransfer',
    contextName: 'CentralTransfers',
    hookName: 'useCentralTransfers',
    itemsName: 'transfers',
    fields: {
      from_account_type: 'string',
      from_account_id: 'string',
      to_account_type: 'string',
      to_account_id: 'string',
      amount: 'number',
      transfer_date: 'string',
      notes: 'string | null',
    }
  },
  {
    file: 'cashback-context.tsx',
    tableName: 'cashback',
    interfaceName: 'Cashback',
    contextName: 'Cashback',
    hookName: 'useCashback',
    itemsName: 'cashbacks',
    fields: {
      source: 'string',
      amount: 'number',
      cashback_date: 'string',
      status: 'string',
    }
  },
  {
    file: 'reconciliation-context.tsx',
    tableName: 'reconciliation',
    interfaceName: 'Reconciliation',
    contextName: 'Reconciliation',
    hookName: 'useReconciliation',
    itemsName: 'reconciliations',
    fields: {
      account_type: 'string',
      account_id: 'string',
      expected_balance: 'number',
      actual_balance: 'number',
      difference: 'number',
      reconciliation_date: 'string',
      notes: 'string | null',
    }
  },
];

console.log('🚀 بدء تحديث Contexts...\n');
console.log(`📋 عدد الملفات: ${contextsToUpdate.length}\n`);

contextsToUpdate.forEach((config, index) => {
  console.log(`${index + 1}. ${config.file} → ${config.tableName}`);
});

console.log('\n⚠️  ملاحظة: هذا السكريبت يعرض فقط الملفات المطلوب تحديثها');
console.log('   التحديث الفعلي سيتم يدوياً أو عبر أداة أخرى\n');

console.log('✅ تم!');

