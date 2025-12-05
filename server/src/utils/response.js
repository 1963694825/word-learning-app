// 统一成功响应
function success(data = null, message = 'success') {
    return {
        code: 200,
        message,
        data,
        timestamp: Date.now()
    };
}

// 统一错误响应
function error(message = 'error', code = 500, data = null) {
    return {
        code,
        message,
        data,
        timestamp: Date.now()
    };
}

// 分页响应
function paginate(list, total, page, pageSize) {
    return {
        code: 200,
        message: 'success',
        data: {
            list,
            pagination: {
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        },
        timestamp: Date.now()
    };
}

module.exports = {
    success,
    error,
    paginate
};
