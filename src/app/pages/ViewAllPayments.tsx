import { MobileHeader } from '../components/MobileHeader';
import { MobileNav } from '../components/MobileNav';
import { Search,  Download,  DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Payment {
  id: string;
  studentName: string;
  parentName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  invoiceNumber: string;
  program: string;
  duration: string;
}

export function ViewAllPayments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // Mock data - replace with real database data
  const allPayments: Payment[] = [
    {
      id: '1',
      studentName: 'Sanad Alaghbar',
      parentName: 'Ahmad Alaghbar',
      amount: 320,
      status: 'paid',
      dueDate: '2025-01-01',
      paidDate: '2024-12-28',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2025-001',
      program: 'Intermediate 2',
      duration: 'January 2025'
    },
    {
      id: '2',
      studentName: 'Maya Hassan',
      parentName: 'Nadia Hassan',
      amount: 280,
      status: 'paid',
      dueDate: '2025-01-01',
      paidDate: '2025-01-01',
      paymentMethod: 'Cash',
      invoiceNumber: 'INV-2025-002',
      program: 'Beginner 3',
      duration: 'January 2025'
    },
    {
      id: '3',
      studentName: 'Karim Fares',
      parentName: 'Samira Fares',
      amount: 380,
      status: 'pending',
      dueDate: '2025-01-05',
      invoiceNumber: 'INV-2025-003',
      program: 'Advanced 1',
      duration: 'January 2025'
    },
    {
      id: '4',
      studentName: 'Lina Abdel',
      parentName: 'Fadi Abdel',
      amount: 300,
      status: 'paid',
      dueDate: '2025-01-01',
      paidDate: '2024-12-30',
      paymentMethod: 'Credit Card',
      invoiceNumber: 'INV-2025-004',
      program: 'Intermediate 1',
      duration: 'January 2025'
    },
    {
      id: '5',
      studentName: 'Ziad Makhlouf',
      parentName: 'Hala Makhlouf',
      amount: 450,
      status: 'paid',
      dueDate: '2025-01-01',
      paidDate: '2024-12-25',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2025-005',
      program: 'Competitive Team',
      duration: 'January 2025'
    },
    {
      id: '6',
      studentName: 'Tala Khoury',
      parentName: 'Marwan Khoury',
      amount: 250,
      status: 'pending',
      dueDate: '2025-01-10',
      invoiceNumber: 'INV-2025-006',
      program: 'Beginner 1',
      duration: 'January 2025'
    },
    {
      id: '7',
      studentName: 'Rami Nassar',
      parentName: 'Dina Nassar',
      amount: 320,
      status: 'overdue',
      dueDate: '2024-12-25',
      invoiceNumber: 'INV-2024-087',
      program: 'Intermediate 3',
      duration: 'December 2024'
    },
    {
      id: '8',
      studentName: 'Jana Sabbagh',
      parentName: 'Rami Sabbagh',
      amount: 380,
      status: 'paid',
      dueDate: '2025-01-01',
      paidDate: '2024-12-29',
      paymentMethod: 'Cash',
      invoiceNumber: 'INV-2025-007',
      program: 'Advanced 2',
      duration: 'January 2025'
    },
    {
      id: '9',
      studentName: 'Nour Hamdan',
      parentName: 'Sarah Hamdan',
      amount: 220,
      status: 'paid',
      dueDate: '2025-01-01',
      paidDate: '2025-01-02',
      paymentMethod: 'Credit Card',
      invoiceNumber: 'INV-2025-008',
      program: 'Aqua Baby',
      duration: 'January 2025'
    },
    {
      id: '10',
      studentName: 'Ali Wehbe',
      parentName: 'Leila Wehbe',
      amount: 280,
      status: 'overdue',
      dueDate: '2024-12-20',
      invoiceNumber: 'INV-2024-085',
      program: 'Beginner 2',
      duration: 'December 2024'
    },
    {
      id: '11',
      studentName: 'Sara Karam',
      parentName: 'Firas Karam',
      amount: 350,
      status: 'pending',
      dueDate: '2025-01-08',
      invoiceNumber: 'INV-2025-009',
      program: 'Aqua-Mermaid',
      duration: 'January 2025'
    },
    {
      id: '12',
      studentName: 'Omar Sleiman',
      parentName: 'Reem Sleiman',
      amount: 500,
      status: 'paid',
      dueDate: '2025-01-01',
      paidDate: '2024-12-27',
      paymentMethod: 'Bank Transfer',
      invoiceNumber: 'INV-2025-010',
      program: 'One-on-One',
      duration: 'January 2025'
    },
    {
      id: '13',
      studentName: 'Yasmine Noun',
      parentName: 'Bassam Noun',
      amount: 280,
      status: 'cancelled',
      dueDate: '2025-01-01',
      invoiceNumber: 'INV-2025-011',
      program: 'Beginner 3',
      duration: 'January 2025'
    },
    {
      id: '14',
      studentName: 'Adam Harb',
      parentName: 'Lara Harb',
      amount: 320,
      status: 'overdue',
      dueDate: '2024-12-28',
      invoiceNumber: 'INV-2024-088',
      program: 'Intermediate 2',
      duration: 'December 2024'
    },
    {
      id: '15',
      studentName: 'Lea Rizk',
      parentName: 'Tony Rizk',
      amount: 380,
      status: 'pending',
      dueDate: '2025-01-12',
      invoiceNumber: 'INV-2025-012',
      program: 'Advanced 1',
      duration: 'January 2025'
    }
  ];

  // Filter payments
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    let matchesMonth = true;
    if (filterMonth !== 'all') {
      const paymentMonth = new Date(payment.dueDate).getMonth();
      matchesMonth = paymentMonth === parseInt(filterMonth);
    }
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Calculate statistics
  const totalPaid = allPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalPending = allPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalOverdue = allPayments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <MobileHeader title="All Payments" showBack={true} showSignOut={true} />
      
      <div className="px-4 py-6 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard 
            value={`$${(totalPaid / 1000).toFixed(1)}k`}
            label="Paid" 
            color="green" 
          />
          <SummaryCard 
            value={`$${(totalPending / 1000).toFixed(1)}k`}
            label="Pending" 
            color="blue" 
          />
          <SummaryCard 
            value={`$${(totalOverdue / 1000).toFixed(1)}k`}
            label="Overdue" 
            color="red" 
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <h3 className="text-sm text-gray-600 mb-3">Payment Overview</h3>
          <div className="space-y-2">
            <StatRow 
              label="Total Revenue"
              value={`$${(totalPaid + totalPending + totalOverdue).toLocaleString()}`}
              color="blue"
            />
            <StatRow 
              label="Collection Rate"
              value={`${Math.round((totalPaid / (totalPaid + totalPending + totalOverdue)) * 100)}%`}
              color="green"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student, parent, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          >
            <option value="all">All Months</option>
            <option value="0">January</option>
            <option value="11">December</option>
            <option value="10">November</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm whitespace-nowrap">
            <Download className="size-4" />
            Export
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredPayments.length} of {allPayments.length} payments
        </div>

        {/* Payment List */}
        <div className="space-y-3">
          {filteredPayments.map(payment => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="size-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No payments found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      <MobileNav />
    </div>
  );
}

interface SummaryCardProps {
  value: string;
  label: string;
  color: 'green' | 'blue' | 'red';
}

function SummaryCard({ value, label, color }: SummaryCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    red: 'bg-red-50 text-red-700 border-red-100'
  };

  return (
    <div className={`${colorClasses[color]} rounded-xl p-3 text-center border`}>
      <div className="text-2xl mb-1">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  color: 'blue' | 'green';
}

function StatRow({ label, value, color }: StatRowProps) {
  const colorClasses = {
    blue: 'text-blue-700',
    green: 'text-green-700'
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm ${colorClasses[color]}`}>{value}</span>
    </div>
  );
}

interface PaymentCardProps {
  payment: Payment;
}

function PaymentCard({ payment }: PaymentCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = {
    paid: {
      icon: <CheckCircle className="size-5 text-green-600" />,
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-100',
      label: 'Paid'
    },
    pending: {
      icon: <Clock className="size-5 text-blue-600" />,
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-100',
      label: 'Pending'
    },
    overdue: {
      icon: <AlertCircle className="size-5 text-red-600" />,
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-100',
      label: 'Overdue'
    },
    cancelled: {
      icon: <XCircle className="size-5 text-gray-600" />,
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-100',
      label: 'Cancelled'
    }
  };

  const config = statusConfig[payment.status];

  return (
    <div className={`bg-white rounded-xl shadow-md border ${config.border} overflow-hidden`}>
      <div 
        className="p-4 cursor-pointer active:bg-gray-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base text-gray-900">{payment.studentName}</h3>
            </div>
            <p className="text-sm text-gray-600">Parent: {payment.parentName}</p>
            <p className="text-xs text-gray-500 mt-1">{payment.program}</p>
          </div>
          <div className={`${config.bg} ${config.text} px-3 py-1 rounded-lg flex items-center gap-1 text-sm`}>
            {config.icon}
            <span className="hidden sm:inline">{config.label}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl text-gray-900">${payment.amount}</div>
            <div className="text-xs text-gray-500">Due: {new Date(payment.dueDate).toLocaleDateString()}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Invoice</div>
            <div className="text-sm text-gray-700">{payment.invoiceNumber}</div>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoItem 
              label="Duration"
              value={payment.duration}
            />
            {payment.paidDate && (
              <InfoItem 
                label="Paid On"
                value={new Date(payment.paidDate).toLocaleDateString()}
              />
            )}
            {payment.paymentMethod && (
              <InfoItem 
                label="Method"
                value={payment.paymentMethod}
              />
            )}
            <InfoItem 
              label="Status"
              value={config.label}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            {payment.status === 'pending' && (
              <button className="px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm active:scale-95 transition-transform">
                Mark as Paid
              </button>
            )}
            {payment.status === 'overdue' && (
              <button className="px-3 py-2 bg-orange-50 text-orange-700 rounded-lg text-sm active:scale-95 transition-transform">
                Send Reminder
              </button>
            )}
            <button className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm active:scale-95 transition-transform">
              View Invoice
            </button>
            <button className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm active:scale-95 transition-transform">
              Contact Parent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}