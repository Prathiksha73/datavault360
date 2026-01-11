import React, { useEffect, useState } from 'react';
import api from '../api';
import { FiUsers, FiActivity, FiDollarSign, FiBox } from 'react-icons/fi';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#0088FE'];


const CustomXAxisTick = ({ x, y, payload }) => {
    if (!payload || !payload.value) return null;

    const [yearStr, monthStr] = payload.value.split('-');
    const date = new Date(parseInt(yearStr), parseInt(monthStr) - 1);
    const monthName = date.toLocaleString('default', { month: 'short' });

    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize={12}>
                <tspan x={0} dy="0.5em" fontWeight="600" fill="#374151">{monthName}</tspan>
                <tspan x={0} dy="1.2em" fontSize={10} fill="#9CA3AF">{yearStr}</tspan>
            </text>
        </g>
    );
};

const InsightsTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('analytics/');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-gray-500">Loading Insights...</div>;
    if (!data) return <div className="p-8 text-red-500">Failed to load data.</div>;

    const { counts, financials, inventory } = data;


    const roomPieData = [
        { name: 'Active (Available)', value: counts.rooms_available },
        { name: 'Occupied', value: counts.rooms_occupied },
        { name: 'Under Maintenance', value: counts.rooms_maintenance },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-8 animate-fade-in-up">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<FiUsers />}
                    label="Total Patients"
                    value={counts.patients}
                    color="text-blue-600" bg="bg-blue-50"
                />
                <StatCard
                    icon={<FiActivity />}
                    label="Active Doctors"
                    value={counts.doctors}
                    color="text-indigo-600" bg="bg-indigo-50"
                />
                <StatCard
                    icon={<FiBox />}
                    label="Total Rooms"
                    value={counts.rooms_total}
                    sub={`(${counts.rooms_available} Available)`}
                    color="text-emerald-600" bg="bg-emerald-50"
                />
                <StatCard
                    icon={<FiDollarSign />}
                    label="Partner Labs"
                    value={counts.labs}
                    color="text-purple-600" bg="bg-purple-50"
                />
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Financial Overview (Last 6 Months)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financials} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    tick={<CustomXAxisTick />}
                                    interval={0}
                                    tickLine={false}
                                    axisLine={{ stroke: '#E5E7EB' }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="Income" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="Expense" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>


                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Room Occupancy & Status</h3>
                    <div className="h-80 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roomPieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {roomPieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>


            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Inventory Management</h3>
                    <span className="text-sm text-gray-500">Showing top items requiring attention</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase text-gray-500 bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Item Name</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Stock Left</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {inventory.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{item.category}</td>
                                    <td className="px-6 py-4 font-bold text-gray-700">{item.quantity} {item.unit}</td>
                                    <td className="px-6 py-4">
                                        {item.quantity <= item.low_stock_threshold ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                In Stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value, sub, color, bg }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
        <div className={`p-4 rounded-full ${bg} ${color} text-2xl`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-gray-800 flex items-baseline">
                {value}
                {sub && <span className="ml-2 text-xs font-normal text-gray-400">{sub}</span>}
            </p>
        </div>
    </div>
);

export default InsightsTab;
