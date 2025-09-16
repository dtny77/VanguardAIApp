import React from 'react';
import { View, Text, StyleSheet, useColorScheme, Dimensions } from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
} from 'react-native-chart-kit';
import { ChartData } from '../services/vanguardApi';

const screenWidth = Dimensions.get('window').width;

interface ChartProps {
  data: ChartData;
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const isDarkMode = useColorScheme() === 'dark';

  const chartConfig = {
    backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
    backgroundGradientFrom: isDarkMode ? '#2a2a2a' : '#ffffff',
    backgroundGradientTo: isDarkMode ? '#1a1a1a' : '#f5f5f5',
    color: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(${isDarkMode ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderChart = () => {
    const chartWidth = screenWidth - 32; // Account for padding

    switch (data.type) {
      case 'line':
        const lineData = {
          labels: data.data.map(item => String(item.x)),
          datasets: [{
            data: data.data.map(item => item.y),
            color: (opacity = 1) => data.colors?.[0] ? `${data.colors[0]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : `rgba(0, 122, 255, ${opacity})`,
            strokeWidth: 2,
          }]
        };
        return (
          <LineChart
            data={lineData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );

      case 'bar':
        const barData = {
          labels: data.data.map(item => String(item.x)),
          datasets: [{
            data: data.data.map(item => item.y),
          }]
        };
        return (
          <BarChart
            data={barData}
            width={chartWidth}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => data.colors?.[0] ? `${data.colors[0]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : `rgba(0, 122, 255, ${opacity})`,
            }}
            verticalLabelRotation={30}
            style={styles.chart}
          />
        );

      case 'pie':
        const pieData = data.data.map((item, index) => ({
          name: String(item.x),
          population: item.y,
          color: data.colors?.[index] || `#${Math.floor(Math.random()*16777215).toString(16)}`,
          legendFontColor: isDarkMode ? '#fff' : '#333',
          legendFontSize: 12,
        }));
        return (
          <PieChart
            data={pieData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[10, 10]}
            absolute
            style={styles.chart}
          />
        );

      default:
        return (
          <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
            Chart type "{data.type}" not supported yet
          </Text>
        );
    }
  };

  return (
    <View style={styles.container}>
      {data.title && (
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          {data.title}
        </Text>
      )}
      {renderChart()}
      {(data.xLabel || data.yLabel) && (
        <View style={styles.labelsContainer}>
          {data.xLabel && (
            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              X: {data.xLabel}
            </Text>
          )}
          {data.yLabel && (
            <Text style={[styles.label, isDarkMode && styles.darkText]}>
              Y: {data.yLabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  errorText: {
    color: '#ff3333',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  darkText: {
    color: '#fff',
  },
});


export default Chart;