const checkResp = function(resp) {
  //    0 和 1  接口正常并且存在数据  2 为登录异常 3 为参数错误 4
  if (resp && (resp.code === 0 || resp.code === 1)) {
    return resp.data;
  }
  return Promise.reject(resp);
};

export default {
  install(Vue) {
    Vue.checkResp = checkResp;
    // 使用Object.defineProperty() get Vue.prototype  $checkResp 属性
    Object.defineProperty(Vue.prototype, '$checkResp', { value: checkResp });
  }
};
