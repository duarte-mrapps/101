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

  const clearFilter = (field?: string) => {
    if (field == 'year.from') {
      setFilter(prevState => ({ ...prevState, year: { from: null, to: prevState?.year?.to } }))
      setFilterTemp(prevState => ({ ...prevState, year: { from: null, to: prevState?.year?.to } }))
    } else if (field == 'year.to') {
      setFilter(prevState => ({ ...prevState, year: { from: prevState?.year?.from, to: null } }))
      setFilterTemp(prevState => ({ ...prevState, year: { from: prevState?.year?.from, to: null } }))
    } else if (field == 'price.from') {
      setFilter(prevState => ({ ...prevState, price: { from: null, to: prevState?.price?.to } }))
      setFilterTemp(prevState => ({ ...prevState, price: { from: null, to: prevState?.price?.to } }))
    } else if (field == 'price.to') {
      setFilter(prevState => ({ ...prevState, price: { from: prevState?.price?.from, to: null } }))
      setFilterTemp(prevState => ({ ...prevState, price: { from: prevState?.price?.from, to: null } }))
    } else if (field) {
      setFilter(prevState => ({ ...prevState, [field]: null }))
      setFilterTemp(prevState => ({ ...prevState, [field]: null }))
    } else {
      setFilter({ condition: 'Novos / Seminovos' })
      setFilterTemp({ condition: 'Novos / Seminovos' })
    }
  }

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