import PropTypes from 'prop-types'
import React, { useState, useCallback, useMemo, useContext } from 'react'
import { Collapse } from 'react-collapse'
import classNames from 'classnames'

import { IconCaret } from 'vtex.store-icons'
import { useCssHandles } from 'vtex.css-handles'

import styles from '../searchResult.css'
import { SearchFilterBar } from './SearchFilterBar'
import SettingsContext from './SettingsContext'

const CSS_HANDLES = [
  'filter__container',
  'filter',
  'filterSelected',
  'filterAvailable',
  'filterTitle',
  'filterIcon',
  'filterContent',
  'filterTemplateOverflow',
]

const useSettings = () => useContext(SettingsContext)

/**
 * Collapsable filters container
 */
const FilterOptionTemplate = ({
  id,
  selected = false,
  title,
  collapsable = true,
  children,
  filters,
  initiallyCollapsed = false,
  lastOpenFilter,
  setLastOpenFilter,
  openFiltersMode,
}) => {
  const [open, setOpen] = useState(!initiallyCollapsed)
  const handles = useCssHandles(CSS_HANDLES)
  const isOpen = openFiltersMode === 'MANY' ? open : lastOpenFilter === title
  const { showFacetSearch } = useSettings()
  const { thresholdForFacetSearch } = useSettings()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredFacets = useMemo(() => {
    if (thresholdForFacetSearch === undefined || searchTerm === '') {
      return filters
    }
    return filters.filter(
      filter => filter.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
    )
  }, [filters, searchTerm, thresholdForFacetSearch])
  const isOpen = openFiltersMode === 'MANY' ? open : lastOpenFilter === title

  const renderChildren = () => {
    if (typeof children !== 'function') {
      return children
    }

    return filteredFacets.map(children)
  }

  const handleCollapse = useCallback(() => {
    if (openFiltersMode === 'MANY') {
      setOpen(!open)
    } else if (openFiltersMode === 'ONE') {
      setLastOpenFilter(lastOpenFilter === title ? null : title)
    } else {
      console.error(
        `Invalid openFiltersMode value: ${openFiltersMode}\nCheck the documentation for the values available`
      )
    }
  }, [lastOpenFilter, open, openFiltersMode, setLastOpenFilter, title])

  const handleKeyDown = useCallback(
    e => {
      if (e.key === ' ' && collapsable) {
        e.preventDefault()
        handleCollapse()
      }
    },
    [collapsable, handleCollapse]
  )

  const containerClassName = classNames(
    handles.filter__container,
    { [`${styles['filter__container']}--${id}`]: id },
    'bb b--muted-4'
  )

  const titleContainerClassName = classNames(handles.filter, 'pv5', {
    [handles.filterSelected]: selected,
    [handles.filterAvailable]: !selected,
  })

  const titleClassName = classNames(
    handles.filterTitle,
    'f5 flex items-center justify-between',
    {
      ttu: selected,
    }
  )

  return (
    <div className={containerClassName}>
      <div className={titleContainerClassName}>
        <div
          role="button"
          tabIndex={collapsable ? 0 : undefined}
          className={collapsable ? 'pointer' : ''}
          onClick={() => collapsable && handleCollapse()}
          onKeyDown={handleKeyDown}
          aria-disabled={!collapsable}
        >
          <div className={titleClassName}>
            {title}
            {collapsable && (
              <span
                className={classNames(
                  handles.filterIcon,
                  'flex items-center ph5 c-muted-3'
                )}
              >
                <IconCaret orientation={isOpen ? 'up' : 'down'} size={14} />
              </span>
            )}
          </div>
        </div>
      </div>
      <div
        className={classNames(handles.filterTemplateOverflow, {
          'overflow-y-auto': collapsable,
          pb5: !collapsable || isOpen,
        })}
        style={{ maxHeight: '200px' }}
        aria-hidden={!isOpen}
      >
        {collapsable ? (
          <Collapse
            isOpened={isOpen}
            theme={{ content: handles.filterContent }}
          >
            {thresholdForFacetSearch !== undefined &&
            thresholdForFacetSearch < filters.length ? (
              <SearchFilterBar name={title} handleChange={setSearchTerm} />
            ) : null}
            {renderChildren()}
          </Collapse>
        ) : (
          renderChildren()
        )}
      </div>
    </div>
  )
}

FilterOptionTemplate.propTypes = {
  /** Identifier to be used by CSS handles */
  id: PropTypes.string,
  /** Filters to be shown, if no filter is provided, treat the children as simple node */
  filters: PropTypes.arrayOf(PropTypes.object),
  /** Function to handle filter rendering or node if no filter is provided */
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
  /** Title */
  title: PropTypes.node,
  /** Whether collapsing is enabled */
  collapsable: PropTypes.bool,
  /** Whether it represents the selected filters */
  selected: PropTypes.bool,
  initiallyCollapsed: PropTypes.bool,
  lastOpenFilter: PropTypes.string,
  setLastOpenFilter: PropTypes.func,
  openFiltersMode: PropTypes.string,
}

export default FilterOptionTemplate
