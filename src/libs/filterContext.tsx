import React, { createContext, PropsWithChildren, useState } from "react";

type FilterProps = {
  type?: 1 | 2
  store: { _id?: string, name?: string }
  condition?: 'Novos / Seminovos' | 'Novos' | 'Seminovos'
  brand?: string
  model?: string
  year?: { from?: number, to?: number }
  price?: { from?: number, to?: number }
  mileage?: number
  transmission?: string[]
  fuel?: string[]
  optionals?: string[]
  color?: string[]
  armored?: boolean,
  featured?: boolean,
}


type FilterContextProps = {
  filter: FilterProps
  filterTemp: FilterProps
  updateFilter: (data: FilterProps) => void
  updateFilterTemp: (data: FilterProps) => void
  clearFilter: (field?: string) => void
}

export const FilterContext = createContext({} as FilterContextProps)

const FilterProvider = ({ children }: PropsWithChildren) => {
  const [filter, setFilter] = useState<FilterProps>({ condition: 'Novos / Seminovos' })
  const [filterTemp, setFilterTemp] = useState<FilterProps>({ condition: 'Novos / Seminovos' })

  const updateFilter = (data: FilterProps) => {
    setFilter(data)
  }

  const updateFilterTemp = (data: FilterProps) => {
    setFilterTemp(data)
  }

  const clearFilter = (fields?: string | string[]) => {
    const fieldsToClear = Array.isArray(fields) ? fields : fields ? [fields] : [];
    
    const clearFieldInState = (prevState: any) => {
      // Limpeza total (quando fields é undefined ou vazio)
      if (!fields || fieldsToClear.length === 0) {
        return { condition: 'Novos / Seminovos' };
      }
  
      // Cria novo objeto sem os campos especificados
      const newState = { ...prevState };
      
      fieldsToClear.forEach(field => {
        if (!field) return;
  
        if (field === 'condition') {
          newState.condition = 'Novos / Seminovos';
        } 
        else if (field.includes('year.')) {
          const [_, subField] = field.split('.');
          if (newState.year) {
            const newYear = { ...newState.year };
            delete newYear[subField];
            newState.year = Object.keys(newYear).length > 0 ? newYear : undefined;
          }
        }
        else if (field.includes('price.')) {
          const [_, subField] = field.split('.');
          if (newState.price) {
            const newPrice = { ...newState.price };
            delete newPrice[subField];
            newState.price = Object.keys(newPrice).length > 0 ? newPrice : undefined;
          }
        }
        else {
          delete newState[field];
        }
      });
  
      return newState;
    };
  
    setFilter(prevState => clearFieldInState(prevState));
    setFilterTemp(prevState => clearFieldInState(prevState));
  };
  return (
    <FilterContext.Provider
      value={{
        filter,
        filterTemp,
        updateFilter,
        updateFilterTemp,
        clearFilter
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}
export default FilterProvider