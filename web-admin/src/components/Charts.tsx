import React from 'react';
import '../styles/components.css';

interface ChartData {
  labels: string[];
  data: number[];
  colors?: string[];
}

interface SimpleChartProps {
  data: ChartData;
  title: string;
  type: 'bar' | 'line' | 'pie';
  height?: number;
}

export const SimpleChart: React.FC<SimpleChartProps> = ({ data, title, type, height = 200 }) => {
  const maxValue = Math.max(...data.data);
  
  const renderBarChart = () => (
    <div className="chart-container" style={{ height }}>
      <h4 className="chart-title">{title}</h4>
      <div className="bar-chart">
        {data.data.map((value, index) => (
          <div key={index} className="bar-item">
            <div 
              className="bar"
              style={{ 
                height: `${(value / maxValue) * 80}%`,
                backgroundColor: data.colors?.[index] || '#3b82f6'
              }}
            />
            <span className="bar-label">{data.labels[index]}</span>
            <span className="bar-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLineChart = () => (
    <div className="chart-container" style={{ height }}>
      <h4 className="chart-title">{title}</h4>
      <div className="line-chart">
        <svg width="100%" height="100%" viewBox="0 0 400 150">
          <polyline
            points={data.data.map((value, index) => 
              `${(index * 400) / (data.data.length - 1)},${150 - (value / maxValue) * 120}`
            ).join(' ')}
            stroke="#3b82f6"
            strokeWidth="2"
            fill="none"
          />
          {data.data.map((value, index) => (
            <circle
              key={index}
              cx={(index * 400) / (data.data.length - 1)}
              cy={150 - (value / maxValue) * 120}
              r="3"
              fill="#3b82f6"
            />
          ))}
        </svg>
        <div className="line-labels">
          {data.labels.map((label, index) => (
            <span key={index} className="line-label">{label}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPieChart = () => {
    const total = data.data.reduce((sum, value) => sum + value, 0);
    let cumulativePercentage = 0;
    
    return (
      <div className="chart-container" style={{ height }}>
        <h4 className="chart-title">{title}</h4>
        <div className="pie-chart-container">
          <svg width="120" height="120" className="pie-chart">
            {data.data.map((value, index) => {
              const percentage = (value / total) * 100;
              const startAngle = (cumulativePercentage / 100) * 360;
              const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
              
              cumulativePercentage += percentage;
              
              const startAngleRad = (startAngle - 90) * (Math.PI / 180);
              const endAngleRad = (endAngle - 90) * (Math.PI / 180);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              const x1 = 60 + 50 * Math.cos(startAngleRad);
              const y1 = 60 + 50 * Math.sin(startAngleRad);
              const x2 = 60 + 50 * Math.cos(endAngleRad);
              const y2 = 60 + 50 * Math.sin(endAngleRad);
              
              const pathData = [
                `M 60 60`,
                `L ${x1} ${y1}`,
                `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={data.colors?.[index] || `hsl(${index * 60}, 70%, 50%)`}
                />
              );
            })}
          </svg>
          <div className="pie-legend">
            {data.labels.map((label, index) => (
              <div key={index} className="pie-legend-item">
                <div 
                  className="pie-legend-color"
                  style={{ backgroundColor: data.colors?.[index] || `hsl(${index * 60}, 70%, 50%)` }}
                />
                <span>{label}: {data.data[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  switch (type) {
    case 'bar':
      return renderBarChart();
    case 'line':
      return renderLineChart();
    case 'pie':
      return renderPieChart();
    default:
      return renderBarChart();
  }
};

export default SimpleChart;