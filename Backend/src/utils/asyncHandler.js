export const asyncHandler = (requestHandler) => {
    return async function(req,res,next){
        try {
            return await requestHandler(req,res,next);
            next();
        } catch (error) {
            next(error)
        }
    }
}