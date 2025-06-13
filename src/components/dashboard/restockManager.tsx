import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { Product } from '@/types/Product';
import * as Papa from 'papaparse';

// Types
interface StockData {
  productId: number;
  stock: number;
}

interface PredictionData {
  productCode: number;
  predicted: number;
}

interface RestockItem {
  productId: number;
  productName: string;
  currentStock: number;
  predictedStock: number;
  restockNeeded: number;
  status: 'low' | 'critical' | 'sufficient';
}

interface RestockManagerProps {
  products: Product[];
  onRestockComplete: () => void;
}

export default function RestockManager({ products, onRestockComplete }: RestockManagerProps) {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [predictionData, setPredictionData] = useState<PredictionData[]>([]);
  const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [isProcessingRestock, setIsProcessingRestock] = useState(false);
  const [showRestockSection, setShowRestockSection] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Always load stock data first
      await fetchStockData();
      
      // Try to load prediction data
      try {
        await loadPredictionData();
      } catch (predictionError) {
        console.warn('Could not load prediction data:', predictionError);
        setError('Prediction data unavailable. Restock recommendations will be limited.');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load stock data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockData = async () => {
    try {
      const stockCollection = collection(db, 'productStock');
      const stockSnapshot = await getDocs(stockCollection);
      
      const stockList: StockData[] = stockSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          productId: Number(data.productId),
          stock: Number(data.stock) || 0
        };
      });
      
      setStockData(stockList);
      return stockList;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      throw new Error('Failed to fetch stock data');
    }
  };

  const loadPredictionData = async () => {
    try {
      let csvData: string = '';

      // Try different methods to load CSV
      if (typeof window !== 'undefined' && 'fs' in window) {
        // Claude artifacts environment
        try {
          csvData = await (window as any).fs.readFile('predictions.csv', { encoding: 'utf8' });
        } catch (fsError) {
          console.log('File not found with fs API, trying fetch...');
          throw new Error('CSV file not found in artifacts environment');
        }
      } else {
        // Regular web environment - Updated paths based on your file structure
        const possiblePaths = [
          '/predictions.csv',
          './predictions.csv',
          'predictions.csv',
          '/src/components/dashboard/predictions.csv',
          './src/components/dashboard/predictions.csv',
          '../predictions.csv', // Relative path from current component location
          process.env.NODE_ENV === 'development' 
            ? '/src/components/dashboard/predictions.csv' 
            : '/predictions.csv'
        ];
        
        let loadSuccess = false;
        let lastError: Error | null = null;
        
        for (const path of possiblePaths) {
          try {
            console.log(`Trying to load CSV from: ${path}`);
            const response = await fetch(path);
            if (response.ok) {
              csvData = await response.text();
              loadSuccess = true;
              console.log(`Successfully loaded CSV from: ${path}`);
              break;
            } else {
              console.log(`Failed to load from ${path}: ${response.status} ${response.statusText}`);
            }
          } catch (err) {
            lastError = err as Error;
            console.log(`Error loading from ${path}:`, err);
            continue;
          }
        }
        
        if (!loadSuccess) {
          throw new Error(`CSV file not found. Tried paths: ${possiblePaths.join(', ')}. Last error: ${lastError?.message}`);
        }
      }

      if (!csvData.trim()) {
        throw new Error('CSV file is empty');
      }

      return await parseCsvData(csvData);
    } catch (error) {
      console.error('Error loading prediction data:', error);
      setPredictionData([]);
      throw error; 
    }
  };

  const parseCsvData = (csvData: string): Promise<PredictionData[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        delimitersToGuess: [',', '\t', '|', ';'],
        complete: (results: Papa.ParseResult<any>) => {
          try {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }

            const predictions: PredictionData[] = results.data
              .map((row: any, index: number) => {
                // Handle different possible column names for product code
                const productCode = row.Product_Code || row.product_code || 
                                  row.ProductCode || row.productId || row.id || row.ID;
                
                // Handle different possible column names for predicted stock
                const predicted = row.Prediction || row.Predicted || row.predicted || 
                                row.predictedStock || row.predicted_stock || 
                                row.PredictedStock || row.demand;

                if (productCode === undefined || productCode === null || productCode === '' ||
                    predicted === undefined || predicted === null || predicted === '') {
                  console.warn(`Row ${index + 1}: Missing required data - productCode: ${productCode}, predicted: ${predicted}`);
                  return null;
                }

                const numProductCode = Number(productCode);
                const numPredicted = Number(predicted);

                if (isNaN(numProductCode) || isNaN(numPredicted) || numPredicted < 0) {
                  console.warn(`Row ${index + 1}: Invalid data - productCode: ${productCode}, predicted: ${predicted}`);
                  return null;
                }

                return {
                  productCode: numProductCode,
                  predicted: numPredicted
                };
              })
              .filter((item: PredictionData | null): item is PredictionData => item !== null);

            if (predictions.length === 0) {
              reject(new Error('No valid prediction data found in CSV. Check column names and data format.'));
              return;
            }

            console.log(`Successfully parsed ${predictions.length} prediction records`);
            setPredictionData(predictions);
            resolve(predictions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Papa.ParseError) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  };

  useEffect(() => {
    if (stockData.length > 0) {
      calculateRestockNeeds();
    }
  }, [stockData, predictionData, products]);

  const calculateRestockNeeds = () => {
    const restockList: RestockItem[] = [];

    if (predictionData.length > 0) {
      // Use prediction-based calculation
      predictionData.forEach(prediction => {
        const product = products.find(p => p.id === prediction.productCode);
        const stock = stockData.find(s => s.productId === prediction.productCode);

        if (product && stock) {
          const restockNeeded = Math.max(0, prediction.predicted - stock.stock);
          
          let status: 'low' | 'critical' | 'sufficient' = 'sufficient';
          if (prediction.predicted > 0) {
            const stockRatio = stock.stock / prediction.predicted;
            if (stockRatio < 0.3) {
              status = 'critical';
            } else if (stockRatio < 0.7) {
              status = 'low';
            }
          }

          restockList.push({
            productId: prediction.productCode,
            productName: product.name,
            currentStock: stock.stock,
            predictedStock: prediction.predicted,
            restockNeeded,
            status
          });
        }
      });
    } else {
      // Fallback: Basic low stock detection without predictions
      stockData.forEach(stock => {
        const product = products.find(p => p.id === stock.productId);
        if (product && stock.stock < 10) { // Arbitrary low stock threshold
          let status: 'low' | 'critical' | 'sufficient' = stock.stock < 5 ? 'critical' : 'low';
          
          restockList.push({
            productId: stock.productId,
            productName: product.name,
            currentStock: stock.stock,
            predictedStock: 0, // No prediction available
            restockNeeded: Math.max(0, 20 - stock.stock), // Suggest restocking to 20 units
            status
          });
        }
      });
    }

    // Sort by priority: critical first, then by restock amount needed
    restockList.sort((a, b) => {
      if (a.status === 'critical' && b.status !== 'critical') return -1;
      if (b.status === 'critical' && a.status !== 'critical') return 1;
      if (a.status === 'low' && b.status === 'sufficient') return -1;
      if (b.status === 'low' && a.status === 'sufficient') return 1;
      return b.restockNeeded - a.restockNeeded;
    });

    setRestockItems(restockList);
  };

  const handleSelectItem = (productId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    const itemsNeedingRestock = restockItems.filter(item => item.restockNeeded > 0);
    if (selectedItems.size === itemsNeedingRestock.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(itemsNeedingRestock.map(item => item.productId)));
    }
  };

  const handleRestockSelected = async () => {
    if (selectedItems.size === 0) {
      alert('Please select items to restock');
      return;
    }

    const selectedItemsData = restockItems.filter(item => selectedItems.has(item.productId));
    const totalRestockAmount = selectedItemsData.reduce((sum, item) => sum + item.restockNeeded, 0);

    if (!confirm(`Restock ${selectedItems.size} items with ${totalRestockAmount} total units?`)) {
      return;
    }

    setIsProcessingRestock(true);

    try {
      const updatePromises = Array.from(selectedItems).map(async (productId) => {
        const item = restockItems.find(i => i.productId === productId);
        if (!item || item.restockNeeded <= 0) return;

        const newStock = item.currentStock + item.restockNeeded;

        // Find and update the stock document
        const stockQuery = query(
          collection(db, 'productStock'),
          where('productId', '==', productId)
        );
        const stockSnapshot = await getDocs(stockQuery);

        if (!stockSnapshot.empty) {
          const stockDoc = stockSnapshot.docs[0];
          await updateDoc(doc(db, 'productStock', stockDoc.id), {
            stock: newStock,
            lastRestocked: new Date(),
            restockAmount: item.restockNeeded
          });
        }
      });

      await Promise.all(updatePromises);

      alert(`Successfully restocked ${selectedItems.size} items!`);
      setSelectedItems(new Set());
      
      // Refresh data
      await fetchStockData();
      onRestockComplete();

    } catch (error) {
      console.error('Error processing restock:', error);
      alert('Failed to process restock. Please try again.');
    } finally {
      setIsProcessingRestock(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'critical':
        return {
          color: 'text-red-400 bg-red-900/20',
          icon: '🚨',
          priority: 'High'
        };
      case 'low':
        return {
          color: 'text-yellow-400 bg-yellow-900/20',
          icon: '⚠️',
          priority: 'Medium'
        };
      default:
        return {
          color: 'text-green-400 bg-green-900/20',
          icon: '✅',
          priority: 'Low'
        };
    }
  };

  // Statistics
  const totalProducts = stockData.length;
  const totalStock = stockData.reduce((sum, stock) => sum + stock.stock, 0);
  const criticalItems = restockItems.filter(item => item.status === 'critical').length;
  const lowStockItems = restockItems.filter(item => item.status === 'low').length;
  const itemsNeedingRestock = restockItems.filter(item => item.restockNeeded > 0);

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Inventory & Restock Management</h2>
        <button
          onClick={() => setShowRestockSection(!showRestockSection)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
        >
          {showRestockSection ? 'Hide' : 'Show'} Restock Manager
        </button>
      </div>

      {showRestockSection && (
        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-yellow-900/20 border border-yellow-500/50 text-yellow-400 p-4 rounded-lg">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Stock Overview */}
          <div className="bg-zinc-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Stock Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-400">{totalProducts}</div>
                <div className="text-sm text-gray-400">Products Tracked</div>
              </div>
              <div className="bg-zinc-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-400">{totalStock.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Stock Units</div>
              </div>
              <div className="bg-zinc-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-400">{criticalItems}</div>
                <div className="text-sm text-gray-400">Critical Items</div>
              </div>
              <div className="bg-zinc-700 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-400">{lowStockItems}</div>
                <div className="text-sm text-gray-400">Low Stock Items</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <div>Loading restock data...</div>
            </div>
          ) : itemsNeedingRestock.length > 0 ? (
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Restock Recommendations</h3>
                <div className="flex gap-4">
                  <button
                    onClick={handleSelectAll}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    {selectedItems.size === itemsNeedingRestock.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={handleRestockSelected}
                    disabled={selectedItems.size === 0 || isProcessingRestock}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed"
                  >
                    {isProcessingRestock ? 'Processing...' : `Restock Selected (${selectedItems.size})`}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-700">
                      <th className="pb-3 font-semibold">Select</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Product</th>
                      <th className="pb-3 font-semibold">Current Stock</th>
                      <th className="pb-3 font-semibold">
                        {predictionData.length > 0 ? 'Predicted Need' : 'Target Stock'}
                      </th>
                      <th className="pb-3 font-semibold">Restock Required</th>
                      <th className="pb-3 font-semibold">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restockItems
                      .filter(item => item.restockNeeded > 0)
                      .map((item) => {
                        const statusConfig = getStatusConfig(item.status);
                        return (
                          <tr key={item.productId} className="border-b border-zinc-700/50">
                            <td className="py-3">
                              <input
                                type="checkbox"
                                checked={selectedItems.has(item.productId)}
                                onChange={() => handleSelectItem(item.productId)}
                                className="w-4 h-4 text-purple-600 bg-zinc-700 border-zinc-600 rounded focus:ring-purple-500"
                              />
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                                {statusConfig.icon} {item.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 font-medium">{item.productName}</td>
                            <td className="py-3">{item.currentStock.toLocaleString()}</td>
                            <td className="py-3">
                              {item.predictedStock > 0 ? item.predictedStock.toLocaleString() : 'N/A'}
                            </td>
                            <td className="py-3">
                              <span className="font-semibold text-orange-400">
                                +{item.restockNeeded.toLocaleString()}
                              </span>
                            </td>
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className={`w-3 h-3 rounded-full mr-2 ${
                                  item.status === 'critical' ? 'bg-red-400' :
                                  item.status === 'low' ? 'bg-yellow-400' : 'bg-green-400'
                                }`}></div>
                                {statusConfig.priority}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {selectedItems.size > 0 && (
                <div className="mt-4 p-4 bg-zinc-700 rounded-lg">
                  <h4 className="font-semibold mb-2">Restock Summary</h4>
                  <div className="text-sm text-gray-300">
                    Selected {selectedItems.size} items for restock. Total units to add: {' '}
                    <span className="font-semibold text-orange-400">
                      {restockItems
                        .filter(item => selectedItems.has(item.productId))
                        .reduce((sum, item) => sum + item.restockNeeded, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-zinc-800 rounded-lg p-6 text-center">
              <div className="text-green-400 text-lg font-semibold mb-2">✅ All Good!</div>
              <div className="text-gray-400">
                {predictionData.length > 0 
                  ? "No items require restocking based on predictions." 
                  : "No low stock items detected."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}