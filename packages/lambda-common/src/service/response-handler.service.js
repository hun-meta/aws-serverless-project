"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHandler = void 0;
const http_status_constant_1 = require("../constant/http-status.constant");
class ResponseHandler {
    static success(data, message = 'Success') {
        return {
            statusCode: http_status_constant_1.HTTP_STATUS.OK,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify({
                success: true,
                message,
                data,
                timestamp: new Date().toISOString()
            })
        };
    }
    static error(error, message = 'Internal Server Error') {
        const statusCode = error.statusCode || http_status_constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
        return {
            statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
            },
            body: JSON.stringify({
                success: false,
                message,
                error: error.message || 'Unknown error occurred',
                timestamp: new Date().toISOString()
            })
        };
    }
    static notFound(message = 'Resource not found') {
        return {
            statusCode: http_status_constant_1.HTTP_STATUS.NOT_FOUND,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message,
                timestamp: new Date().toISOString()
            })
        };
    }
    static badRequest(message = 'Bad request') {
        return {
            statusCode: http_status_constant_1.HTTP_STATUS.BAD_REQUEST,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message,
                timestamp: new Date().toISOString()
            })
        };
    }
    static unauthorized(message = 'Unauthorized') {
        return {
            statusCode: http_status_constant_1.HTTP_STATUS.UNAUTHORIZED,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                message,
                timestamp: new Date().toISOString()
            })
        };
    }
}
exports.ResponseHandler = ResponseHandler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtaGFuZGxlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVzcG9uc2UtaGFuZGxlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDJFQUErRDtBQUUvRCxNQUFhLGVBQWU7SUFDMUIsTUFBTSxDQUFDLE9BQU8sQ0FBSSxJQUFPLEVBQUUsVUFBa0IsU0FBUztRQUNwRCxPQUFPO1lBQ0wsVUFBVSxFQUFFLGtDQUFXLENBQUMsRUFBRTtZQUMxQixPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFFLGtCQUFrQjtnQkFDbEMsNkJBQTZCLEVBQUUsR0FBRztnQkFDbEMsOEJBQThCLEVBQUUsNEJBQTRCO2dCQUM1RCw4QkFBOEIsRUFBRSw2QkFBNkI7YUFDOUQ7WUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDbkIsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTztnQkFDUCxJQUFJO2dCQUNKLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUNwQyxDQUFDO1NBQ0gsQ0FBQztJQUNKLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQVUsRUFBRSxVQUFrQix1QkFBdUI7UUFDaEUsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsSUFBSSxrQ0FBVyxDQUFDLHFCQUFxQixDQUFDO1FBRXpFLE9BQU87WUFDTCxVQUFVO1lBQ1YsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxrQkFBa0I7Z0JBQ2xDLDZCQUE2QixFQUFFLEdBQUc7Z0JBQ2xDLDhCQUE4QixFQUFFLDRCQUE0QjtnQkFDNUQsOEJBQThCLEVBQUUsNkJBQTZCO2FBQzlEO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU87Z0JBQ1AsS0FBSyxFQUFFLEtBQUssQ0FBQyxPQUFPLElBQUksd0JBQXdCO2dCQUNoRCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDcEMsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxVQUFrQixvQkFBb0I7UUFDcEQsT0FBTztZQUNMLFVBQVUsRUFBRSxrQ0FBVyxDQUFDLFNBQVM7WUFDakMsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxrQkFBa0I7Z0JBQ2xDLDZCQUE2QixFQUFFLEdBQUc7YUFDbkM7WUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztnQkFDbkIsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsT0FBTztnQkFDUCxTQUFTLEVBQUUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUU7YUFDcEMsQ0FBQztTQUNILENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFrQixhQUFhO1FBQy9DLE9BQU87WUFDTCxVQUFVLEVBQUUsa0NBQVcsQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyw2QkFBNkIsRUFBRSxHQUFHO2FBQ25DO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU87Z0JBQ1AsU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2FBQ3BDLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sQ0FBQyxZQUFZLENBQUMsVUFBa0IsY0FBYztRQUNsRCxPQUFPO1lBQ0wsVUFBVSxFQUFFLGtDQUFXLENBQUMsWUFBWTtZQUNwQyxPQUFPLEVBQUU7Z0JBQ1AsY0FBYyxFQUFFLGtCQUFrQjtnQkFDbEMsNkJBQTZCLEVBQUUsR0FBRzthQUNuQztZQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDO2dCQUNuQixPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPO2dCQUNQLFNBQVMsRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTthQUNwQyxDQUFDO1NBQ0gsQ0FBQztJQUNKLENBQUM7Q0FDRjtBQW5GRCwwQ0FtRkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcbmltcG9ydCB7IEhUVFBfU1RBVFVTIH0gZnJvbSAnLi4vY29uc3RhbnQvaHR0cC1zdGF0dXMuY29uc3RhbnQnO1xuXG5leHBvcnQgY2xhc3MgUmVzcG9uc2VIYW5kbGVyIHtcbiAgc3RhdGljIHN1Y2Nlc3M8VD4oZGF0YTogVCwgbWVzc2FnZTogc3RyaW5nID0gJ1N1Y2Nlc3MnKTogQVBJR2F0ZXdheVByb3h5UmVzdWx0IHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogSFRUUF9TVEFUVVMuT0ssXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSxBdXRob3JpemF0aW9uJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULFBPU1QsUFVULERFTEVURSxPUFRJT05TJ1xuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc3VjY2VzczogdHJ1ZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgZGF0YSxcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyBlcnJvcihlcnJvcjogYW55LCBtZXNzYWdlOiBzdHJpbmcgPSAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyk6IEFQSUdhdGV3YXlQcm94eVJlc3VsdCB7XG4gICAgY29uc3Qgc3RhdHVzQ29kZSA9IGVycm9yLnN0YXR1c0NvZGUgfHwgSFRUUF9TVEFUVVMuSU5URVJOQUxfU0VSVkVSX0VSUk9SO1xuICAgIFxuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6ICdDb250ZW50LVR5cGUsQXV0aG9yaXphdGlvbicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogJ0dFVCxQT1NULFBVVCxERUxFVEUsT1BUSU9OUydcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICBlcnJvcjogZXJyb3IubWVzc2FnZSB8fCAnVW5rbm93biBlcnJvciBvY2N1cnJlZCcsXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICB9KVxuICAgIH07XG4gIH1cblxuICBzdGF0aWMgbm90Rm91bmQobWVzc2FnZTogc3RyaW5nID0gJ1Jlc291cmNlIG5vdCBmb3VuZCcpOiBBUElHYXRld2F5UHJveHlSZXN1bHQge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiBIVFRQX1NUQVRVUy5OT1RfRk9VTkQsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKidcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfSlcbiAgICB9O1xuICB9XG5cbiAgc3RhdGljIGJhZFJlcXVlc3QobWVzc2FnZTogc3RyaW5nID0gJ0JhZCByZXF1ZXN0Jyk6IEFQSUdhdGV3YXlQcm94eVJlc3VsdCB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IEhUVFBfU1RBVFVTLkJBRF9SRVFVRVNULFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBzdWNjZXNzOiBmYWxzZSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgICAgdGltZXN0YW1wOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKClcbiAgICAgIH0pXG4gICAgfTtcbiAgfVxuXG4gIHN0YXRpYyB1bmF1dGhvcml6ZWQobWVzc2FnZTogc3RyaW5nID0gJ1VuYXV0aG9yaXplZCcpOiBBUElHYXRld2F5UHJveHlSZXN1bHQge1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiBIVFRQX1NUQVRVUy5VTkFVVEhPUklaRUQsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKidcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxuICAgICAgfSlcbiAgICB9O1xuICB9XG59Il19