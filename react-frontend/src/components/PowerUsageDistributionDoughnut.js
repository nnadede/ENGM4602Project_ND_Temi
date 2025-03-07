import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Legend, Tooltip, Cell } from 'recharts';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#A569BD',
  '#E74C3C',
  '#5DADE2',
  '#F4D03F',
  '#2ECC71'
];

const formatMonthYear = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split("-"); //dateStr is in the format "YYYY-MM-DD"
  const year = parts[0];
  const month = parts[1];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;//month is 1-based index in JS Date object but 0-based in monthNames array 
};

function PowerUsageDistributionDoughnut({ month }) {
  const [data, setData] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [highestUsage, setHighestUsage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!month) return;
    setLoading(true);
    axios
      .get('http://127.0.0.1:5000/readings', { params: { month } })
      .then((response) => {
        const readings = response.data.readings || [];
        if (readings.length === 0) {
          setData([]);
          setTotalUsage(0);
          setHighestUsage(null);
          return;
        }

        // Aggregate usage by category
        const agg = {};
        readings.forEach((r) => {
          agg[r.category] = (agg[r.category] || 0) + r.usage;
        });

        let chartData = Object.keys(agg).map((key) => ({
          name: key,
          value: agg[key]
        }));

        // Sort data by category name to have an organized legend
        chartData.sort((a, b) => a.name.localeCompare(b.name));

        setData(chartData);

        // Calculate total usage
        const tUsage = chartData.reduce((sum, item) => sum + item.value, 0);
        setTotalUsage(tUsage);

        // Find highest usage
        const highest = chartData.reduce(
          (prev, curr) => (curr.value > prev.value ? curr : prev),
          chartData[0]
        );
        setHighestUsage(highest);
      })
      .catch(() => setError('Error fetching usage breakdown.'))
      .finally(() => setLoading(false));
  }, [month]);

  const clearError = () => setError(null);

  if (loading) return <LoadingSpinner asOverlay />;
  if (error) return <ErrorModal error={error} onClear={clearError} />;

  return (
    <Card>
      <h3>Power Usage Distribution for {formatMonthYear(month)}</h3>
      {data.length > 0 ? (
        <>
          {/* Center the chart within the card */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PieChart width={600} height={350}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                label={(entry) => `${entry.name}: ${entry.value.toFixed(2)} kWh`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)} kWh`} />
              <Legend 
                layout="horizontal" 
                align="center" 
                verticalAlign="bottom" 
              />
            </PieChart>
          </div>

          <p>Total Usage: {totalUsage.toFixed(2)} kWh</p>
          {highestUsage && (
            <p>
              Highest Usage: {highestUsage.name} ({highestUsage.value.toFixed(2)} kWh)
            </p>
          )}
        </>
      ) : (
        <p>No data available for this month.</p>
      )}
    </Card>
  );
}

export default PowerUsageDistributionDoughnut;
