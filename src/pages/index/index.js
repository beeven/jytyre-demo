"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app = getApp();
Page({
    async onLoad() {
        await app.ensureLogin();
    },
    onGetUserInfo(e) {
        if (e.detail.errMsg != "getUserInfo:ok") {
            wx.showModal({
                title: '先生贵姓？',
                content: '请告诉我您是谁，才能给给您打开个人中心哦',
                showCancel: false,
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定');
                    }
                }
            });
        }
        else {
            app.globalData.userInfo = e.detail.userInfo;
            wx.navigateTo({ url: "../userConsole/userConsole" });
        }
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBLE1BQU0sR0FBRyxHQUFHLE1BQU0sRUFBVSxDQUFDO0FBRTdCLElBQUksQ0FBQztJQUNILEtBQUssQ0FBQyxNQUFNO1FBQ1YsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVELGFBQWEsQ0FBQyxDQUEwQjtRQUV0QyxJQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLGdCQUFnQixFQUFFO1lBQ3RDLEVBQUUsQ0FBQyxTQUFTLENBQUM7Z0JBQ1gsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsT0FBTyxFQUFFLHNCQUFzQjtnQkFDL0IsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLE9BQU8sRUFBRSxVQUFVLEdBQUc7b0JBQ2xCLElBQUksR0FBRyxDQUFDLE9BQU8sRUFBRTt3QkFDYixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFBO3FCQUN4QjtnQkFDTCxDQUFDO2FBQ0YsQ0FBQyxDQUFDO1NBQ0o7YUFBTTtZQUNMLEdBQUcsQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzVDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBQyxHQUFHLEVBQUMsNEJBQTRCLEVBQUMsQ0FBQyxDQUFDO1NBQ25EO0lBRUgsQ0FBQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElNeUFwcCB9IGZyb20gXCIuLi8uLi9hcHBcIjtcblxuXG5jb25zdCBhcHAgPSBnZXRBcHA8SU15QXBwPigpO1xuXG5QYWdlKHtcbiAgYXN5bmMgb25Mb2FkKCkge1xuICAgIGF3YWl0IGFwcC5lbnN1cmVMb2dpbigpO1xuICB9LFxuXG4gIG9uR2V0VXNlckluZm8oZTogZXZlbnQuQnV0dG9uR2V0VXNlckluZm8pIHtcblxuICAgIGlmKGUuZGV0YWlsLmVyck1zZyAhPSBcImdldFVzZXJJbmZvOm9rXCIpIHtcbiAgICAgIHd4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiAn5YWI55Sf6LS15aeT77yfJyxcbiAgICAgICAgY29udGVudDogJ+ivt+WRiuivieaIkeaCqOaYr+iwge+8jOaJjeiDvee7mee7meaCqOaJk+W8gOS4quS6uuS4reW/g+WTpicsXG4gICAgICAgIHNob3dDYW5jZWw6IGZhbHNlLFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzLmNvbmZpcm0pIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygn55So5oi354K55Ye756Gu5a6aJylcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFwcC5nbG9iYWxEYXRhLnVzZXJJbmZvID0gZS5kZXRhaWwudXNlckluZm87XG4gICAgICB3eC5uYXZpZ2F0ZVRvKHt1cmw6XCIuLi91c2VyQ29uc29sZS91c2VyQ29uc29sZVwifSk7XG4gICAgfVxuICAgIFxuICB9XG59KTtcblxuLy8gUGFnZSh7XG4vLyAgIGRhdGE6IHtcbi8vICAgfSxcblxuLy8gICBvbkxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGlmICghd3guY2xvdWQpIHtcbiAgICAvLyAgIHd4LnJlZGlyZWN0VG8oe1xuICAgIC8vICAgICB1cmw6ICcuLi9jaG9vc2VMaWIvY2hvb3NlTGliJyxcbiAgICAvLyAgIH0pXG4gICAgLy8gICByZXR1cm5cbiAgICAvLyB9XG5cbiAgICAvLyDojrflj5bnlKjmiLfkv6Hmga9cbiAgICAvLyB3eC5nZXRTZXR0aW5nKHtcbiAgICAvLyAgIHN1Y2Nlc3M6IHJlcyA9PiB7XG4gICAgLy8gICAgIGlmIChyZXMuYXV0aFNldHRpbmdbJ3Njb3BlLnVzZXJJbmZvJ10pIHtcbiAgICAvLyAgICAgICAvLyDlt7Lnu4/mjojmnYPvvIzlj6/ku6Xnm7TmjqXosIPnlKggZ2V0VXNlckluZm8g6I635Y+W5aS05YOP5pi156ew77yM5LiN5Lya5by55qGGXG4gICAgLy8gICAgICAgd3guZ2V0VXNlckluZm8oe1xuICAgIC8vICAgICAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgICAvLyAgICAgICAgICAgdGhpcy5zZXREYXRhKHtcbiAgICAvLyAgICAgICAgICAgICBhdmF0YXJVcmw6IHJlcy51c2VySW5mby5hdmF0YXJVcmwsXG4gICAgLy8gICAgICAgICAgICAgdXNlckluZm86IHJlcy51c2VySW5mb1xuICAgIC8vICAgICAgICAgICB9KVxuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICAgIH0pXG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH1cbiAgICAvLyB9KVxuICAvLyAgIGFwcC5lbnN1cmVMb2dpbigpO1xuICAvLyB9LFxuXG4gIC8vIG9uR2V0VXNlckluZm86IGZ1bmN0aW9uKGUpIHtcbiAgLy8gICBpZiAoIXRoaXMubG9nZ2VkICYmIGUuZGV0YWlsLnVzZXJJbmZvKSB7XG4gIC8vICAgICB0aGlzLnNldERhdGEoe1xuICAvLyAgICAgICBsb2dnZWQ6IHRydWUsXG4gIC8vICAgICAgIGF2YXRhclVybDogZS5kZXRhaWwudXNlckluZm8uYXZhdGFyVXJsLFxuICAvLyAgICAgICB1c2VySW5mbzogZS5kZXRhaWwudXNlckluZm9cbiAgLy8gICAgIH0pXG4gIC8vICAgfVxuICAvLyB9LFxuXG4gIC8vIG9uR2V0T3BlbmlkOiBmdW5jdGlvbigpIHtcbiAgLy8gICAvLyDosIPnlKjkupHlh73mlbBcbiAgLy8gICB3eC5jbG91ZC5jYWxsRnVuY3Rpb24oe1xuICAvLyAgICAgbmFtZTogJ2xvZ2luJyxcbiAgLy8gICAgIGRhdGE6IHt9LFxuICAvLyAgICAgc3VjY2VzczogcmVzID0+IHtcbiAgLy8gICAgICAgY29uc29sZS5sb2coJ1vkupHlh73mlbBdIFtsb2dpbl0gdXNlciBvcGVuaWQ6ICcsIHJlcy5yZXN1bHQub3BlbmlkKVxuICAvLyAgICAgICBhcHAuZ2xvYmFsRGF0YS5vcGVuaWQgPSByZXMucmVzdWx0Lm9wZW5pZFxuICAvLyAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgLy8gICAgICAgICB1cmw6ICcuLi91c2VyQ29uc29sZS91c2VyQ29uc29sZScsXG4gIC8vICAgICAgIH0pXG4gIC8vICAgICB9LFxuICAvLyAgICAgZmFpbDogZXJyID0+IHtcbiAgLy8gICAgICAgY29uc29sZS5lcnJvcignW+S6keWHveaVsF0gW2xvZ2luXSDosIPnlKjlpLHotKUnLCBlcnIpXG4gIC8vICAgICAgIHd4Lm5hdmlnYXRlVG8oe1xuICAvLyAgICAgICAgIHVybDogJy4uL2RlcGxveUZ1bmN0aW9ucy9kZXBsb3lGdW5jdGlvbnMnLFxuICAvLyAgICAgICB9KVxuICAvLyAgICAgfVxuICAvLyAgIH0pXG4gIC8vIH0sXG5cbiAgLy8gLy8g5LiK5Lyg5Zu+54mHXG4gIC8vIGRvVXBsb2FkOiBmdW5jdGlvbiAoKSB7XG4gIC8vICAgLy8g6YCJ5oup5Zu+54mHXG4gIC8vICAgd3guY2hvb3NlSW1hZ2Uoe1xuICAvLyAgICAgY291bnQ6IDEsXG4gIC8vICAgICBzaXplVHlwZTogWydjb21wcmVzc2VkJ10sXG4gIC8vICAgICBzb3VyY2VUeXBlOiBbJ2FsYnVtJywgJ2NhbWVyYSddLFxuICAvLyAgICAgc3VjY2VzczogZnVuY3Rpb24gKHJlcykge1xuXG4gIC8vICAgICAgIHd4LnNob3dMb2FkaW5nKHtcbiAgLy8gICAgICAgICB0aXRsZTogJ+S4iuS8oOS4rScsXG4gIC8vICAgICAgIH0pXG5cbiAgLy8gICAgICAgY29uc3QgZmlsZVBhdGggPSByZXMudGVtcEZpbGVQYXRoc1swXVxuICAgICAgICBcbiAgLy8gICAgICAgLy8g5LiK5Lyg5Zu+54mHXG4gIC8vICAgICAgIGNvbnN0IGNsb3VkUGF0aCA9ICdteS1pbWFnZScgKyBmaWxlUGF0aC5tYXRjaCgvXFwuW14uXSs/JC8pWzBdXG4gIC8vICAgICAgIHd4LmNsb3VkLnVwbG9hZEZpbGUoe1xuICAvLyAgICAgICAgIGNsb3VkUGF0aCxcbiAgLy8gICAgICAgICBmaWxlUGF0aCxcbiAgLy8gICAgICAgICBzdWNjZXNzOiByZXMgPT4ge1xuICAvLyAgICAgICAgICAgY29uc29sZS5sb2coJ1vkuIrkvKDmlofku7ZdIOaIkOWKn++8micsIHJlcylcblxuICAvLyAgICAgICAgICAgYXBwLmdsb2JhbERhdGEuZmlsZUlEID0gcmVzLmZpbGVJRFxuICAvLyAgICAgICAgICAgYXBwLmdsb2JhbERhdGEuY2xvdWRQYXRoID0gY2xvdWRQYXRoXG4gIC8vICAgICAgICAgICBhcHAuZ2xvYmFsRGF0YS5pbWFnZVBhdGggPSBmaWxlUGF0aFxuICAgICAgICAgICAgXG4gIC8vICAgICAgICAgICB3eC5uYXZpZ2F0ZVRvKHtcbiAgLy8gICAgICAgICAgICAgdXJsOiAnLi4vc3RvcmFnZUNvbnNvbGUvc3RvcmFnZUNvbnNvbGUnXG4gIC8vICAgICAgICAgICB9KVxuICAvLyAgICAgICAgIH0sXG4gIC8vICAgICAgICAgZmFpbDogZSA9PiB7XG4gIC8vICAgICAgICAgICBjb25zb2xlLmVycm9yKCdb5LiK5Lyg5paH5Lu2XSDlpLHotKXvvJonLCBlKVxuICAvLyAgICAgICAgICAgd3guc2hvd1RvYXN0KHtcbiAgLy8gICAgICAgICAgICAgaWNvbjogJ25vbmUnLFxuICAvLyAgICAgICAgICAgICB0aXRsZTogJ+S4iuS8oOWksei0pScsXG4gIC8vICAgICAgICAgICB9KVxuICAvLyAgICAgICAgIH0sXG4gIC8vICAgICAgICAgY29tcGxldGU6ICgpID0+IHtcbiAgLy8gICAgICAgICAgIHd4LmhpZGVMb2FkaW5nKClcbiAgLy8gICAgICAgICB9XG4gIC8vICAgICAgIH0pXG5cbiAgLy8gICAgIH0sXG4gIC8vICAgICBmYWlsOiBlID0+IHtcbiAgLy8gICAgICAgY29uc29sZS5lcnJvcihlKVxuICAvLyAgICAgfVxuICAvLyAgIH0pXG4gIC8vIH0sXG5cbi8vIH0pXG4iXX0=