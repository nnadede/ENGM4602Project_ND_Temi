import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Legend, Tooltip, Cell } from 'recharts';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#E74C3C', '#5DADE2', '#F4D03F', '#2ECC71'];

function PowerUsageDistributionDoughnut({ month }) {
  const [data, setData] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [highestUsage, setHighestUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    axios.get('http://127.0.0.1:5000/readings', { params: { month } })
      .then(response => {
        const readings = response.data.readings;
        if (!readings || readings.length === 0) {
          setData([]);
          setTotalUsage(0);
          setHighestUsage(null);
          return;
        }
        // Aggregate usage by category
        const agg = {};
        readings.forEach(r => {
          agg[r.category] = (agg[r.category] || 0) + r.usage;
        });
        const chartData = Object.keys(agg).map(key => ({ name: key, value: agg[key] }));
        setData(chartData);
        const tUsage = chartData.reduce((sum, item) => sum + item.value, 0);
        setTotalUsage(tUsage);
        const highest = chartData.reduce((prev, curr) => (curr.value > prev.value ? curr : prev), chartData[0]);
        setHighestUsage(highest);
      })
      .catch(err => setError('Error fetching usage breakdown.'))
      .finally(() => setLoading(false));
  }, [month]);

  const clearError = () => setError(null);

  if (loading) return <LoadingSpinner asOverlay />;
  if (error) return <ErrorModal error={error} onClear={clearError} />;

  return (
    <Card>
      <h3>Power Usage Distribution for {month}</h3>
      {data.length > 0 ? (
        <>
          <PieChart width={300} height={300}>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={40}
              label
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
          </PieChart>
          <p>Total Usage: {totalUsage.toFixed(2)} kWh</p>
          {highestUsage && <p>Highest: {highestUsage.name} ({highestUsage.value.toFixed(2)} kWh)</p>}
        </>
      ) : (
        <p>No data available for this month.</p>
      )}
    </Card>
  );
}

export default PowerUsageDistributionDoughnut;
