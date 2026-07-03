// components/DataTable.jsx
import React, { useState } from 'react'
import { Table, Pagination, Empty, Space, Button } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons'

const DataTable = ({ columns, data, onRowClick, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc')

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  // Convert custom columns to Ant Design table columns
  const antColumns = columns.map(col => ({
    title: (
      <div 
        className={`flex items-center gap-1 ${col.sortable !== false ? 'cursor-pointer hover:text-blue-600' : ''}`}
        onClick={() => col.sortable !== false && handleSort(col.key)}
      >
        {col.label}
        {sortColumn === col.key && (
          <span className="text-blue-600">
            {sortDirection === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          </span>
        )}
      </div>
    ),
    dataIndex: col.key,
    key: col.key,
    render: col.render ? (text, record) => col.render(text, record) : undefined,
    sorter: col.sortable !== false ? (a, b) => {
      const aVal = a[col.key]
      const bVal = b[col.key]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal)
      }
      return aVal - bVal
    } : undefined,
    defaultSortOrder: sortColumn === col.key ? (sortDirection === 'asc' ? 'ascend' : 'descend') : undefined,
    ...col
  }))

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current || 1)
  }

  const handleRowClick = (record) => {
    if (onRowClick) {
      onRowClick(record)
    }
  }

  return (
    <div>
      <Table
        columns={antColumns}
        dataSource={data}
        rowKey={(record, index) => record.id || record.key || index}
        pagination={{
          current: currentPage,
          pageSize: itemsPerPage,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Total ${total} items`,
          onChange: (page) => setCurrentPage(page)
        }}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
          className: 'cursor-pointer hover:bg-gray-50'
        })}
        onChange={handleTableChange}
        locale={{
          emptyText: (
            <Empty 
              description="No data available" 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        }}
        className="rounded-lg overflow-hidden"
        scroll={{ x: true }}
        size="middle"
        bordered={false}
      />
    </div>
  )
}

export default DataTable