'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function OneRMChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="h-64 flex items-center justify-center text-gray-500">No data available for Bench Press</div>
    }

    return (
        <div className="h-64 w-full bg-gray-900 rounded-xl p-4 border border-gray-800">
            <h3 className="text-lg font-bold mb-4">Bench Press 1RM Progress</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                        itemStyle={{ color: '#818cf8' }}
                    />
                    <Line type="monotone" dataKey="oneRM" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
