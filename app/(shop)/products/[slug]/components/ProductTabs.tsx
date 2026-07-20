'use client'

import React from 'react'
import { Info } from 'lucide-react'

const ProductTabs = ({
  description,
}: {
  description: string
}) => {
  return (
    <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
      {/* Tab Header */}
      <div className="flex border-b border-brand-border">
        <div className="flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-medium text-brand-red bg-brand-light-bg border-b-2 border-brand-red">
          <Info className="w-4 h-4" />
          <span>Description</span>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <div className="prose max-w-none">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ProductTabs
