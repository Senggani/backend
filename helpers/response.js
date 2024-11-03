const notAllowed = (res, message) => {
    let response = {
        status: 401,
        message: message
    }
    res.status(401).json(response)
}
const success = (res, message = 'Success', data, meta = null) => {
    let response = {
            status: 200,
            message: message,
            data: data,
            meta: meta
        }
        // // console.log(response);
    res.status(200).json(response)
}
const error = (res, message) => {
    let response = {
            status: 500,
            message: message
        }
        // // console.log(response);
    res.status(500).json(response)
}
const noContent = (res) => {
    res.status(204)
}
const notFound = (res, message) => {
    let response = {
            status: 404,
            message: message
        }
        // // console.log(response);
    res.status(404).json(response)
}
const failed = (res, message, error) => {
    let response = {
            status: 400,
            message: message,
            error: error
        }
        // // console.log(response);
    res.status(400).json(response)
}

module.exports = {
    success,
    error,
    noContent,
    notFound,
    failed,
    notAllowed
}