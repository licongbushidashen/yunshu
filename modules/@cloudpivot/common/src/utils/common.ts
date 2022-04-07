export const isDingtalk = /DingTalk/.test(navigator.userAgent);
export const isWechat = /wxwork/.test(navigator.userAgent);

export const isiOS = !!navigator.userAgent.match(
	/\(i[^;]+;( U;)? CPU.+Mac OS X/
); // 判断是否ios终端

export const isPC = !/(Android|iPhone)/.test(navigator.userAgent); // 判断用户使用设备是否是 PC

export default {
	isDingtalk,
	isWechat,
	isiOS,
	isPC,
};
