import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';

export default function ElevationChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <div className="elevation-chart-empty">No elevation data available</div>;
  }

  // Determine dynamic limits with padding
  const elevations = data.map(d => d.elevation);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);
  
  const yDomainMin = Math.floor((minElevation - 50) / 100) * 100;
  const yDomainMax = Math.ceil((maxElevation + 50) / 100) * 100;

  // The starting point represents the crater rim
  const rimElevation = data[0]?.elevation || -2850;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-dist">Distance: {label} m</p>
          <p className="tooltip-elev">Elevation: {payload[0].value} m</p>
          <p className="tooltip-diff">Depth: {Math.abs(payload[0].value - rimElevation)} m below rim</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="elevation-profile-container">
      <div className="chart-header">
        <span className="chart-header-indicator"></span>
        <h3 className="chart-header-title">ROVER TRAVERSE ELEVATION PROFILE</h3>
      </div>
      
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid stroke="#222233" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="distance"
              stroke="#AAAAAA"
              tickLine={false}
              axisLine={{ stroke: '#222233' }}
              tickFormatter={(val) => `${val}m`}
              fontSize={11}
            />
            <YAxis
              stroke="#AAAAAA"
              tickLine={false}
              axisLine={{ stroke: '#222233' }}
              domain={[yDomainMin, yDomainMax]}
              tickFormatter={(val) => `${val}m`}
              fontSize={11}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Horizontal line showing crater rim */}
            <ReferenceLine
              y={rimElevation}
              stroke="#8A2BE2"
              strokeDasharray="4 4"
              label={{
                value: `Rim Rim: ${rimElevation}m`,
                fill: '#8A2BE2',
                fontSize: 10,
                position: 'top'
              }}
            />
            
            <Line
              type="monotone"
              dataKey="elevation"
              stroke="#FF6B00"
              strokeWidth={3}
              dot={{ fill: '#FF6B00', r: 3 }}
              activeDot={{ r: 6, stroke: '#0a0a0f', strokeWidth: 2 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
