"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cloud = require("wx-server-sdk");
const licensePlate_1 = require("./licensePlate");
cloud.init();
function main(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileID = event.fileID;
        const res = yield cloud.downloadFile({
            fileID: fileID
        });
        const buffer = res.fileContent;
        let imgData = buffer.toString("base64");
        let ret = yield licensePlate_1.scanPlate(imgData);
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
    });
}
exports.main = main;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBRUEsdUNBQXVDO0FBQ3ZDLGlEQUE2RDtBQUU3RCxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFLWixTQUFzQixJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU87O1FBRXJDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDNUIsTUFBTSxHQUFHLEdBQUcsTUFBTSxLQUFLLENBQUMsWUFBWSxDQUFDO1lBQ2pDLE1BQU0sRUFBRSxNQUFNO1NBQ2pCLENBQUMsQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQyxXQUFXLENBQUM7UUFDL0IsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN4QyxJQUFJLEdBQUcsR0FBRyxNQUFNLHdCQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsSUFBRyxHQUFHLENBQUMsWUFBWSxFQUFFO1lBQ2pCLE9BQU87Z0JBQ0gsTUFBTSxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTTtnQkFDL0IsV0FBVyxFQUFFLEdBQUcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDNUMsVUFBVSxFQUFFLElBQUk7Z0JBQ2hCLFNBQVMsRUFBRSxJQUFJO2FBQ2xCLENBQUE7U0FDSjthQUFNO1lBQ0gsT0FBTztnQkFDSCxTQUFTLEVBQUUsR0FBRyxDQUFDLFNBQVM7Z0JBQ3hCLFVBQVUsRUFBRSxHQUFHLENBQUMsVUFBVTthQUM3QixDQUFBO1NBQ0o7SUFVTCxDQUFDO0NBQUE7QUEvQkQsb0JBK0JDIiwic291cmNlc0NvbnRlbnQiOlsiLy8g5LqR5Ye95pWw5YWl5Y+j5paH5Lu2XHJcbi8vY29uc3QgY2xvdWQgPSByZXF1aXJlKCd3eC1zZXJ2ZXItc2RrJyk7XHJcbmltcG9ydCAqIGFzIGNsb3VkIGZyb20gJ3d4LXNlcnZlci1zZGsnO1xyXG5pbXBvcnQge3NjYW5QbGF0ZSwgc2NhblBsYXRlRnJvbUZpbGUgfSBmcm9tIFwiLi9saWNlbnNlUGxhdGVcIjtcclxuXHJcbmNsb3VkLmluaXQoKVxyXG5cclxuXHJcblxyXG4vLyDkupHlh73mlbDlhaXlj6Plh73mlbBcclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG1haW4oZXZlbnQsIGNvbnRleHQpIHtcclxuICAgIC8vY29uc3Qgd3hDb250ZXh0ID0gY2xvdWQuZ2V0V1hDb250ZXh0KClcclxuICAgIGNvbnN0IGZpbGVJRCA9IGV2ZW50LmZpbGVJRDtcclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IGNsb3VkLmRvd25sb2FkRmlsZSh7XHJcbiAgICAgICAgZmlsZUlEOiBmaWxlSURcclxuICAgIH0pO1xyXG4gICAgY29uc3QgYnVmZmVyID0gcmVzLmZpbGVDb250ZW50O1xyXG4gICAgbGV0IGltZ0RhdGEgPSBidWZmZXIudG9TdHJpbmcoXCJiYXNlNjRcIik7XHJcbiAgICBsZXQgcmV0ID0gYXdhaXQgc2NhblBsYXRlKGltZ0RhdGEpO1xyXG4gICAgaWYocmV0LndvcmRzX3Jlc3VsdCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG51bWJlcjogcmV0LndvcmRzX3Jlc3VsdC5udW1iZXIsXHJcbiAgICAgICAgICAgIHByb2JhYmlsaXR5OiByZXQud29yZHNfcmVzdWx0LnByb2JhYmlsaXR5WzBdLFxyXG4gICAgICAgICAgICBlcnJvcl9jb2RlOiBudWxsLFxyXG4gICAgICAgICAgICBlcnJvcl9tc2c6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVycm9yX21zZzogcmV0LmVycm9yX21zZyxcclxuICAgICAgICAgICAgZXJyb3JfY29kZTogcmV0LmVycm9yX2NvZGVcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgXHJcblxyXG4gICAgLy8gcmV0dXJuIHtcclxuICAgIC8vICAgICBldmVudCxcclxuICAgIC8vICAgICBvcGVuaWQ6IHd4Q29udGV4dC5PUEVOSUQsXHJcbiAgICAvLyAgICAgYXBwaWQ6IHd4Q29udGV4dC5BUFBJRCxcclxuICAgIC8vICAgICB1bmlvbmlkOiB3eENvbnRleHQuVU5JT05JRCxcclxuICAgIC8vIH1cclxufSJdfQ==