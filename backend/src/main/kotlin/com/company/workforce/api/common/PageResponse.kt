package com.company.workforce.api.common

data class PageResponse<T>(val data: List<T>, val page: Int, val pageSize: Int, val total: Long)
