import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getComparison } from '../api/comparison';
import { getCompetitors } from '../api/competitors';

export default function Comparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: allCompetitors, isLoading: loadingCompetitors } = useQuery({
    queryKey: ['competitors'],
    queryFn: getCompetitors
  });

  const { data: comparisonData, isLoading: loadingComparison } = useQuery({
    queryKey: ['comparison', selectedIds],
    queryFn: () => getComparison(selectedIds),
    enabled: selectedIds.length > 0,
  });

  const toggleCompetitor = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      } else {
        alert("You can select up to 5 competitors.");
      }
    }
  };

  const productRows = React.useMemo(() => {
    if (!comparisonData?.competitors) return [];
    
    const productNames = new Set<string>();
    comparisonData.competitors.forEach(comp => {
      comp.products.forEach(p => productNames.add(p.name));
    });

    return Array.from(productNames).map(name => {
      const rowData: Record<string, any> = { name };
      const prices: number[] = [];
      
      comparisonData.competitors.forEach(comp => {
        const product = comp.products.find(p => p.name === name);
        rowData[comp.id] = product;
        if (product && product.lastPrice !== null && product.lastPrice !== undefined) {
          prices.push(product.lastPrice);
        }
      });

      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

      return { name, rowData, minPrice, maxPrice };
    });
  }, [comparisonData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">Competitor Comparison</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3">Select Competitors (up to 5)</h2>
        {loadingCompetitors ? (
          <p className="text-sm text-gray-500">Loading competitors...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allCompetitors?.map((comp: any) => (
              <button
                key={comp.id}
                onClick={() => toggleCompetitor(comp.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  selectedIds.includes(comp.id)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {comp.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedIds.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitors Selected</h3>
          <p className="text-gray-500">Select at least one competitor above to see a side-by-side comparison of their products.</p>
        </div>
      ) : loadingComparison ? (
        <div className="p-8 text-center text-gray-500">Loading comparison data...</div>
      ) : comparisonData?.competitors.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No comparison data available.</div>
      ) : (
        <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                {comparisonData?.competitors.map(comp => (
                  <th key={comp.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {comp.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productRows.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.name}
                  </td>
                  {comparisonData?.competitors.map(comp => {
                    const product = row.rowData[comp.id];
                    let bgColor = 'bg-gray-100 text-gray-800';
                    if (product && product.lastPrice !== null && product.lastPrice !== undefined) {
                      if (product.lastPrice === row.minPrice && row.minPrice !== row.maxPrice) {
                        bgColor = 'bg-green-100 text-green-800';
                      } else if (product.lastPrice === row.maxPrice && row.minPrice !== row.maxPrice) {
                        bgColor = 'bg-red-100 text-red-800';
                      }
                    }

                    return (
                      <td key={comp.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product ? (
                          <div className={`inline-flex px-2 py-1 rounded font-medium ${bgColor}`}>
                            {product.lastPrice !== null && product.lastPrice !== undefined
                              ? `${product.currency || '$'}${product.lastPrice}` 
                              : product.lastStatus}
                          </div>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
