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
let db = cloud.database();
function main(event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const fileData = event.fileData;
        const fileExt = event.fileExt;
        const warrantyID = event.warrantyID;
        let scanTask = licensePlate_1.scanPlate(fileData);
        let uploadTask = cloud.uploadFile({
            cloudPath: `warranty/${warrantyID}/licensePlate${fileExt}`,
            fileContent: Buffer.from(fileData, "base64")
        }).then((res) => {
            return Promise.all([Promise.resolve(res.fileID),
                db.collection("warranty").doc(warrantyID).update({
                    data: {
                        plateImageFileID: res.fileID
                    }
                })]);
        });
        let p = yield Promise.all([scanTask, uploadTask]);
        let scanTaskResult = p[0];
        let uploadTaskResult = p[1];
        if (scanTaskResult.words_result) {
            return {
                fileID: uploadTaskResult[0],
                number: scanTaskResult.words_result.number,
                probability: scanTaskResult.words_result.probability[0],
                error_code: null,
                error_msg: null
            };
        }
        else {
            return {
                error_msg: scanTaskResult.error_msg,
                error_code: scanTaskResult.error_code
            };
        }
    });
}
exports.main = main;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBRUEsdUNBQXVDO0FBQ3ZDLGlEQUE2RDtBQUU3RCxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUE7QUFDWixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7QUFLMUIsU0FBc0IsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPOztRQUdyQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDO1FBQ2hDLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDOUIsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztRQUVwQyxJQUFJLFFBQVEsR0FBRyx3QkFBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRW5DLElBQUksVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUM7WUFDOUIsU0FBUyxFQUFFLFlBQVksVUFBVSxnQkFBZ0IsT0FBTyxFQUFFO1lBQzFELFdBQVcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBQyxRQUFRLENBQUM7U0FDOUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBQyxFQUFFO1lBQ1gsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUMvQyxFQUFFLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxNQUFNLENBQUM7b0JBQzdDLElBQUksRUFBRTt3QkFDRixnQkFBZ0IsRUFBRSxHQUFHLENBQUMsTUFBTTtxQkFDL0I7aUJBQ0osQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNULENBQUMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDbEQsSUFBSSxjQUFjLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzFCLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTVCLElBQUcsY0FBYyxDQUFDLFlBQVksRUFBRTtZQUM1QixPQUFPO2dCQUNILE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLE1BQU0sRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDLE1BQU07Z0JBQzFDLFdBQVcsRUFBRSxjQUFjLENBQUMsWUFBWSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7Z0JBQ3ZELFVBQVUsRUFBRSxJQUFJO2dCQUNoQixTQUFTLEVBQUUsSUFBSTthQUNsQixDQUFBO1NBQ0o7YUFBTTtZQUNILE9BQU87Z0JBQ0gsU0FBUyxFQUFFLGNBQWMsQ0FBQyxTQUFTO2dCQUNuQyxVQUFVLEVBQUUsY0FBYyxDQUFDLFVBQVU7YUFDeEMsQ0FBQTtTQUNKO0lBVUwsQ0FBQztDQUFBO0FBaERELG9CQWdEQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIOS6keWHveaVsOWFpeWPo+aWh+S7tlxyXG4vL2NvbnN0IGNsb3VkID0gcmVxdWlyZSgnd3gtc2VydmVyLXNkaycpO1xyXG5pbXBvcnQgKiBhcyBjbG91ZCBmcm9tICd3eC1zZXJ2ZXItc2RrJztcclxuaW1wb3J0IHtzY2FuUGxhdGUsIHNjYW5QbGF0ZUZyb21GaWxlIH0gZnJvbSBcIi4vbGljZW5zZVBsYXRlXCI7XHJcblxyXG5jbG91ZC5pbml0KClcclxubGV0IGRiID0gY2xvdWQuZGF0YWJhc2UoKTtcclxuXHJcblxyXG5cclxuLy8g5LqR5Ye95pWw5YWl5Y+j5Ye95pWwXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtYWluKGV2ZW50LCBjb250ZXh0KSB7XHJcbiAgICAvL2NvbnN0IHd4Q29udGV4dCA9IGNsb3VkLmdldFdYQ29udGV4dCgpO1xyXG5cclxuICAgIGNvbnN0IGZpbGVEYXRhID0gZXZlbnQuZmlsZURhdGE7XHJcbiAgICBjb25zdCBmaWxlRXh0ID0gZXZlbnQuZmlsZUV4dDtcclxuICAgIGNvbnN0IHdhcnJhbnR5SUQgPSBldmVudC53YXJyYW50eUlEO1xyXG5cclxuICAgIGxldCBzY2FuVGFzayA9IHNjYW5QbGF0ZShmaWxlRGF0YSk7XHJcblxyXG4gICAgbGV0IHVwbG9hZFRhc2sgPSBjbG91ZC51cGxvYWRGaWxlKHtcclxuICAgICAgICBjbG91ZFBhdGg6IGB3YXJyYW50eS8ke3dhcnJhbnR5SUR9L2xpY2Vuc2VQbGF0ZSR7ZmlsZUV4dH1gLFxyXG4gICAgICAgIGZpbGVDb250ZW50OiBCdWZmZXIuZnJvbShmaWxlRGF0YSxcImJhc2U2NFwiKVxyXG4gICAgfSkudGhlbigocmVzKT0+e1xyXG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChbUHJvbWlzZS5yZXNvbHZlKHJlcy5maWxlSUQpLFxyXG4gICAgICAgIGRiLmNvbGxlY3Rpb24oXCJ3YXJyYW50eVwiKS5kb2Mod2FycmFudHlJRCkudXBkYXRlKHtcclxuICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgcGxhdGVJbWFnZUZpbGVJRDogcmVzLmZpbGVJRFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSldKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGxldCBwID0gYXdhaXQgUHJvbWlzZS5hbGwoW3NjYW5UYXNrLCB1cGxvYWRUYXNrXSk7XHJcbiAgICBsZXQgc2NhblRhc2tSZXN1bHQgPSBwWzBdO1xyXG4gICAgbGV0IHVwbG9hZFRhc2tSZXN1bHQgPSBwWzFdO1xyXG5cclxuICAgIGlmKHNjYW5UYXNrUmVzdWx0LndvcmRzX3Jlc3VsdCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGZpbGVJRDogdXBsb2FkVGFza1Jlc3VsdFswXSxcclxuICAgICAgICAgICAgbnVtYmVyOiBzY2FuVGFza1Jlc3VsdC53b3Jkc19yZXN1bHQubnVtYmVyLFxyXG4gICAgICAgICAgICBwcm9iYWJpbGl0eTogc2NhblRhc2tSZXN1bHQud29yZHNfcmVzdWx0LnByb2JhYmlsaXR5WzBdLFxyXG4gICAgICAgICAgICBlcnJvcl9jb2RlOiBudWxsLFxyXG4gICAgICAgICAgICBlcnJvcl9tc2c6IG51bGxcclxuICAgICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGVycm9yX21zZzogc2NhblRhc2tSZXN1bHQuZXJyb3JfbXNnLFxyXG4gICAgICAgICAgICBlcnJvcl9jb2RlOiBzY2FuVGFza1Jlc3VsdC5lcnJvcl9jb2RlXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG5cclxuICAgIC8vIHJldHVybiB7XHJcbiAgICAvLyAgICAgZXZlbnQsXHJcbiAgICAvLyAgICAgb3BlbmlkOiB3eENvbnRleHQuT1BFTklELFxyXG4gICAgLy8gICAgIGFwcGlkOiB3eENvbnRleHQuQVBQSUQsXHJcbiAgICAvLyAgICAgdW5pb25pZDogd3hDb250ZXh0LlVOSU9OSUQsXHJcbiAgICAvLyB9XHJcbn0iXX0=