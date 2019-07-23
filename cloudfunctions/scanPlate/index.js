"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloud = require("wx-server-sdk");
const licensePlate_1 = require("./licensePlate");
cloud.init();
async function main(event, context) {
    console.log(event);
    const fileID = event.fileID;
    const res = await cloud.downloadFile({
        fileID: fileID
    });
    const buffer = res.fileContent;
    let ret = await licensePlate_1.scanPlate(buffer.toString("base64"));
    if (ret.words_result) {
        return {
            number: ret.words_result.number,
            probability: ret.words_result.probability[0],
            error_code: null,
            error_msg: null
        };
    }
    else {
        return {
            error_msg: ret.error_msg,
            error_code: ret.error_code
        };
    }
}
exports.main = main;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHVDQUF1QztBQUN2QyxpREFBNkQ7QUFFN0QsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFBO0FBS0wsS0FBSyxVQUFVLElBQUksQ0FBQyxLQUFLLEVBQUUsT0FBTztJQUdyQyxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBRW5CLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7SUFDNUIsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsWUFBWSxDQUFDO1FBQ2pDLE1BQU0sRUFBRSxNQUFNO0tBQ2pCLENBQUMsQ0FBQztJQUVILE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7SUFFL0IsSUFBSSxHQUFHLEdBQUcsTUFBTSx3QkFBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUVyRCxJQUFHLEdBQUcsQ0FBQyxZQUFZLEVBQUU7UUFDakIsT0FBTztZQUNILE1BQU0sRUFBRSxHQUFHLENBQUMsWUFBWSxDQUFDLE1BQU07WUFDL0IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUM1QyxVQUFVLEVBQUUsSUFBSTtZQUNoQixTQUFTLEVBQUUsSUFBSTtTQUNsQixDQUFBO0tBQ0o7U0FBTTtRQUNILE9BQU87WUFDSCxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7WUFDeEIsVUFBVSxFQUFFLEdBQUcsQ0FBQyxVQUFVO1NBQzdCLENBQUE7S0FDSjtBQVVMLENBQUM7QUFwQ0Qsb0JBb0NDIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5LqR5Ye95pWw5YWl5Y+j5paH5Lu2XG4vL2NvbnN0IGNsb3VkID0gcmVxdWlyZSgnd3gtc2VydmVyLXNkaycpO1xuaW1wb3J0ICogYXMgY2xvdWQgZnJvbSAnd3gtc2VydmVyLXNkayc7XG5pbXBvcnQge3NjYW5QbGF0ZSwgc2NhblBsYXRlRnJvbUZpbGUgfSBmcm9tIFwiLi9saWNlbnNlUGxhdGVcIjtcblxuY2xvdWQuaW5pdCgpXG5cblxuXG4vLyDkupHlh73mlbDlhaXlj6Plh73mlbBcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKGV2ZW50LCBjb250ZXh0KSB7XG4gICAgLy9jb25zdCB3eENvbnRleHQgPSBjbG91ZC5nZXRXWENvbnRleHQoKVxuXG4gICAgY29uc29sZS5sb2coZXZlbnQpO1xuXG4gICAgY29uc3QgZmlsZUlEID0gZXZlbnQuZmlsZUlEO1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGNsb3VkLmRvd25sb2FkRmlsZSh7XG4gICAgICAgIGZpbGVJRDogZmlsZUlEXG4gICAgfSk7XG5cbiAgICBjb25zdCBidWZmZXIgPSByZXMuZmlsZUNvbnRlbnQ7XG5cbiAgICBsZXQgcmV0ID0gYXdhaXQgc2NhblBsYXRlKGJ1ZmZlci50b1N0cmluZyhcImJhc2U2NFwiKSk7XG5cbiAgICBpZihyZXQud29yZHNfcmVzdWx0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBudW1iZXI6IHJldC53b3Jkc19yZXN1bHQubnVtYmVyLFxuICAgICAgICAgICAgcHJvYmFiaWxpdHk6IHJldC53b3Jkc19yZXN1bHQucHJvYmFiaWxpdHlbMF0sXG4gICAgICAgICAgICBlcnJvcl9jb2RlOiBudWxsLFxuICAgICAgICAgICAgZXJyb3JfbXNnOiBudWxsXG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZXJyb3JfbXNnOiByZXQuZXJyb3JfbXNnLFxuICAgICAgICAgICAgZXJyb3JfY29kZTogcmV0LmVycm9yX2NvZGVcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxuXG4gICAgLy8gcmV0dXJuIHtcbiAgICAvLyAgICAgZXZlbnQsXG4gICAgLy8gICAgIG9wZW5pZDogd3hDb250ZXh0Lk9QRU5JRCxcbiAgICAvLyAgICAgYXBwaWQ6IHd4Q29udGV4dC5BUFBJRCxcbiAgICAvLyAgICAgdW5pb25pZDogd3hDb250ZXh0LlVOSU9OSUQsXG4gICAgLy8gfVxufSJdfQ==