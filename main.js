import Vue from 'vue'
import store from './store'
import App from './App'

import Json from './Json' //测试用数据

import Pubjs from 'store/public.js';
Vue.prototype.pubjs=Pubjs;
/**
 *  因工具函数属于公司资产, 所以直接在Vue实例挂载几个常用的函数
 *  所有测试用数据均存放于根目录json.js
 *  
 *  css部分使用了App.vue下的全局样式和iconfont图标，有需要图标库的可以留言。
 *  示例使用了uni.scss下的变量, 除变量外已尽量移除特有语法,可直接替换为其他预处理器使用
 */
const msg = (title, duration=1500, mask=false, icon='none')=>{
	//统一提示方便全局修改
	if(Boolean(title) === false){
		return;
	}
	uni.showToast({
		title,
		duration,
		mask,
		icon
	});
}
const json = type=>{
	//模拟异步请求数据
	return new Promise(resolve=>{
		setTimeout(()=>{
			resolve(Json[type]);
		}, 500)
	})
}

const prePage = ()=>{
	let pages = getCurrentPages();
	
	let prePage = pages[pages.length - 2];
	console.log(prePage);
	// #ifdef H5
	return prePage;
	// #endif
	return prePage.$vm;
}


Vue.config.productionTip = false
Vue.prototype.apiServer='http://jiwuyouxuan.com/api/v2.';
Vue.prototype.$fire = new Vue();
Vue.prototype.$store = store;
Vue.prototype.$api = {msg, json, prePage};

//登录验证
Vue.prototype.checkLoginWx= function(uri,param,gourlnum){
	// var wxApiUrl='http://jiwuyouxuan.com/?url='+uri;
	var wxApiUrl='http://jiwuyouxuan.com/index/index/h5?url='+uri;
	if(Object.keys(param).length !== 0){
		var lstoken=param.data;
		if(lstoken==undefined && !uni.getStorageSync('key')){
			window.location.href=wxApiUrl
			return
		}else if(lstoken && !uni.getStorageSync('key')){
			setTimeout(()=>{
				// console.log(this.apiServer+'login/checklogin');
				uni.request({
					url: this.apiServer+'login/checkloginwx',
					data: {
						lstoken:lstoken,
					},
					method:'POST',
					header:{
						'content-type' : "application/x-www-form-urlencoded"
					},
					success: (res) => {
						res = res.data;
						// 登录成功 记录会员信息到本地
						if(res.codes == 200){
							uni.setStorageSync('key',res.data.token);
							this.pubjs.GoUrl_(uri,gourlnum);
							 location.reload();
							return;
						}
						if(res.codes == 302){
							
							uni.showModal({ //
								title: "登录提示",  
								content: res.mess,  
								showCancel:false,
								success: (res1) => {  
									if (res1.confirm) {  
										try {
										    uni.removeStorageSync('key');
										} catch (e) {
										    // error
										}
										window.location.href=wxApiUrl;
										// uni.redirectTo({
										// 	url:'/pages/public/login'
										// }) 
									}  
								}  
							}) 
						}
						if(res.codes == 301){
							uni.showModal({ //
								title: "登录提示",  
								content: res.mess,  
								showCancel:false,
								success: (res1) => {  
									if (res1.confirm) {
										try {
										    uni.removeStorageSync('key');
										} catch (e) {
										    // error
										}
										window.location.href=wxApiUrl;
										//this.logout();
										// uni.removeStorageSync('key');
										// uni.removeStorageSync('Mess');
										// uni.removeStorageSync('id');
										// uni.removeStorageSync('me');
										
										// uni.redirectTo({
										// 	url:'/pages/public/login'
										// }) 
									}  
								}  
							}) 
						}
					},
					fail: (data, code) => {
						uni.hideLoading()
						uni.showToast({title: res.mess,icon:"none"});
					}
				});
			},1000)
			//拉取数据结束
			return;
		}
		
		
	}
	if(!uni.getStorageSync('key')){
		window.location.href=wxApiUrl;
	}
}
// tabBar购物车总数量角标
Vue.prototype.cartTolNumber=function(number){
	if(number>0){
		uni.setTabBarBadge({
		  index: 2,
		  text: number.toString()
		})
	}else if(number==0){
		uni.removeTabBarBadge({
		  index: 2,
		})
	}else{
		
	
		// uni.showLoading({
		// 	title: '处理中...'
		// })
		
		var data={};
		data.token=uni.getStorageSync('key');
	
		//拉取数据开始
		setTimeout(()=>{
			uni.request({
				url: this.apiServer+'home/cartTolNumber',
				data: data,
				method:'POST',
				dataType:'json',
				header:{
					'content-type' : "application/x-www-form-urlencoded"
				},
				success: (res) => {
					// uni.hideLoading();
					// console.log(res);
					res = res.data;
					if(res.codes == 200){
						let list = res.data;
						// console.log(list.num);
						if(list.num>0){
							uni.setTabBarBadge({
							  index: 2,
							  text: list.num.toString()
							})
						}
						
						// return list.num.toString();;
						
					}else{
						// uni.showToast({title:res.mess,Number:3000});
					}
				},
				fail: (data, code) => {
					// uni.hideLoading()
					uni.showToast({title: res.mess,icon:"none"});
				}
			});
		},1);
		//拉取数据结束
	}
}


App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()