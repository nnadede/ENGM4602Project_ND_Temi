import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import CostDistributionDoughnut from './CostDistributionDoughnut';
import PowerUsageDistributionDoughnut from './PowerUsageDistributionDoughnut';

function Home() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCostMonth, setSelectedCostMonth] = useState(null);
  const [selectedUsageMonth, setSelectedUsageMonth] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://127.0.0.1:5000/history');
        const hist = response.data.history || [];
        setHistory(hist);
        if (hist.length > 0) {
          // Default to the most recent month
          const latest = hist[hist.length - 1].simulation_date;
          setSelectedCostMonth(latest);
          setSelectedUsageMonth(latest);
        }
      } catch (err) {
        setError('Could not fetch history data.');
      }
      setIsLoading(false);
    };
    fetchHistory();
  }, []);

  const clearError = () => {
    setError(null);
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && <LoadingSpinner asOverlay />}
      <Card>
        <h1>Smart Home Energy Monitor</h1>
        <p>Welcome to the dashboard!</p>
      </Card>

      {history.length > 0 && (
        <>
          <Card>
            <h2>Cost per Month</h2>
            <BarChart
              width={600}
              height={300}
              data={history}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={(data) => {
                if (data && data.activeLabel) {
                  setSelectedCostMonth(data.activeLabel);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="simulation_date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_cost" fill="#8884d8" name="Cost (USD)" />
            </BarChart>
          </Card>
          <Card>
            <h2>Power Usage per Month</h2>
            <BarChart
              width={600}
              height={300}
              data={history}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              onClick={(data) => {
                if (data && data.activeLabel) {
                  setSelectedUsageMonth(data.activeLabel);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="simulation_date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_usage" fill="#82ca9d" name="Usage (kWh)" />
            </BarChart>
          </Card>
          <Card>
            <CostDistributionDoughnut month={selectedCostMonth} />
          </Card>
          <Card>
            <PowerUsageDistributionDoughnut month={selectedUsageMonth} />
          </Card>
        </>
      )}

      {history.length === 0 && !isLoading && (
        <Card>
          <p>No historical data found. Simulate your first month to begin!</p>
        </Card>
      )}
    </>
  );
}

export default Home;
