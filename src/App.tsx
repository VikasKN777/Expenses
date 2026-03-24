import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  PieChart as PieChartIcon, 
  LayoutDashboard, 
  List, 
  TrendingUp, 
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar as CalendarIcon,
  Tag,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, subMonths, startOfDay } from 'date-fns';
import { Expense, Category, CATEGORIES, CATEGORY_COLORS } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [view, setView] = useState<'dashboard' | 'list'>('dashboard');
  const [isAdding, setIsAdding] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return expenses.filter(e => isWithinInterval(parseISO(e.date), { start, end }));
  }, [expenses, currentMonth]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const categoryData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      data[e.category] = (data[e.category] || 0) + e.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  const dailyData = useMemo(() => {
    const data: Record<string, number> = {};
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    
    // Initialize all days of the month
    let current = start;
    while (current <= end) {
      data[format(current, 'dd')] = 0;
      current = new Date(current.setDate(current.getDate() + 1));
    }

    filteredExpenses.forEach(e => {
      const day = format(parseISO(e.date), 'dd');
      data[day] = (data[day] || 0) + e.amount;
    });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [filteredExpenses, currentMonth]);

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount: Number(amount),
      category,
      description,
      date: new Date(date).toISOString(),
    };

    setExpenses([newExpense, ...expenses]);
    setAmount('');
    setDescription('');
    setIsAdding(false);
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + offset);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-around items-center md:top-0 md:bottom-auto md:flex-col md:w-20 md:h-full md:border-t-0 md:border-r z-50">
        <div className="hidden md:flex items-center justify-center w-12 h-12 bg-black text-white rounded-xl mb-8">
          <Wallet size={24} />
        </div>
        <button 
          onClick={() => setView('dashboard')}
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            view === 'dashboard' ? "bg-black text-white" : "text-gray-400 hover:bg-gray-100"
          )}
        >
          <LayoutDashboard size={24} />
        </button>
        <button 
          onClick={() => setView('list')}
          className={cn(
            "p-3 rounded-xl transition-all duration-200",
            view === 'list' ? "bg-black text-white" : "text-gray-400 hover:bg-gray-100"
          )}
        >
          <List size={24} />
        </button>
        <div className="md:mt-auto">
          <button 
            onClick={() => setIsAdding(true)}
            className="p-3 bg-black text-white rounded-full shadow-lg hover:scale-110 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="md:ml-20 pb-24 md:pb-0 p-4 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ExpenseFlow</h1>
            <p className="text-gray-500">Manage your monthly spending</p>
          </div>
          
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <span className="px-4 font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </header>

        {view === 'dashboard' ? (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-black text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-gray-400 text-sm font-medium mb-1">Total Spent</p>
                  <h2 className="text-4xl font-bold">${totalSpent.toLocaleString()}</h2>
                  <div className="mt-4 flex items-center text-xs text-gray-400">
                    <TrendingUp size={14} className="mr-1" />
                    <span>This month's summary</span>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Wallet size={120} />
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Transactions</p>
                  <h2 className="text-3xl font-bold">{filteredExpenses.length}</h2>
                </div>
                <div className="mt-4 flex items-center text-xs text-green-500 font-medium">
                  <ArrowUpRight size={14} className="mr-1" />
                  <span>Active spending</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium mb-1">Top Category</p>
                  <h2 className="text-3xl font-bold">
                    {categoryData.length > 0 
                      ? categoryData.sort((a,b) => b.value - a.value)[0].name 
                      : 'N/A'}
                  </h2>
                </div>
                <div className="mt-4 flex items-center text-xs text-orange-500 font-medium">
                  <Tag size={14} className="mr-1" />
                  <span>Highest expense</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <PieChartIcon size={20} className="mr-2" />
                  Category Breakdown
                </h3>
                <div className="h-[300px] w-full">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      No data for this month
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center">
                  <TrendingUp size={20} className="mr-2" />
                  Daily Spending
                </h3>
                <div className="h-[300px] w-full">
                  {filteredExpenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dailyData}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="value" fill="#000" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 italic">
                      No data for this month
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Recent Transactions</h3>
              <span className="text-sm text-gray-500">{filteredExpenses.length} items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-400 bg-gray-50">
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold text-right">Amount</th>
                    <th className="px-6 py-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(parseISO(expense.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium">{expense.description || 'No description'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${CATEGORY_COLORS[expense.category]}20`, 
                              color: CATEGORY_COLORS[expense.category] 
                            }}
                          >
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-bold">
                          ${expense.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => deleteExpense(expense.id)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                        No transactions found for this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add Expense Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Add Expense</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-black">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold">$</span>
                  <input 
                    type="number" 
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-4 text-3xl font-bold focus:ring-2 focus:ring-black transition-all"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                        category === cat 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</label>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this for?"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-black transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Date</label>
                  <div className="relative">
                    <CalendarIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-4 text-sm focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-black text-white rounded-2xl py-4 font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

