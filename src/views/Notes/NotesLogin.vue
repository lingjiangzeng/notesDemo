<template>
<div class="NotesLogin">
    <!-- 登录logo-->
    <div class="logoext"><span>爱云校笔记</span></div>
    <!-- 登录和注册框-->
    <div class="login_register" v-loading="loading" :element-loading-text="loadtext" element-loading-spinner="el-icon-loading">
        <!-- 登录-->
         <el-tabs v-model="activeName">
            <el-tab-pane label="登录" name="login" >
                <el-input class="elinput" placeholder="输入手机号" v-model="phone"> </el-input>
                <el-input class="elinput" type="password" placeholder="输入密码" v-model="password"> </el-input>
                <div class="buttonbox"><el-button type="primary" @click="login()">登录</el-button></div>
            </el-tab-pane>
            <!--注册 -->
            <el-tab-pane label="注册" name="register">
                <el-input class="elinput" placeholder="输入手机号" v-model="phone"> </el-input>
                <el-input class="elinput" type="password" placeholder="输入密码" v-model="password"> </el-input>
                <el-input class="elinput" placeholder="昵称" v-model="nickName"> </el-input>
                <div class="buttonbox"><el-button type="primary" @click="register()">注册</el-button></div>
            </el-tab-pane>
          </el-tabs>
    </div>
</div>
</template>
<script>
export default{
  name: 'NotesLogin',
  data() {
    return {
      phone: '',
      password: '',
      nickName: '',
      activeName: 'login',
      loading: false,
      loadtext: '登录中'
    };
  },
  methods: {
    /*
      登录方法
      */
    login: function() {
      /* 简单的表单验证 */
      let re = /^1\d{10}$/;
      if (!re.test(this.phone)) {
        this.$message('请正确输入手号！');
        return;
      }
      if (this.password === '') {
        this.$message('请输入密码！');
        return;
      }
      this.loadtext = '登录中...';
      this.loading = true;
      this.$http.post('/bolg/v1/users/sessions', {
        phone: this.phone,
        password: this.password
      }).then((result) => {
        return this.$checkResp(result);
      }).then((result) => {
        sessionStorage.setItem('userinfo', JSON.stringify(result));
        this.loading = false;
        this.$router.replace({ path: '/notes' });
      }).catch((result) => {
        this.loading = false;
        this.$message.error(result.msg);
      });
    },
    /* 注册方法 */
    register: function() {
      /* 简单的表单验证 */
      let re = /^1\d{10}$/;
      if (!re.test(this.phone)) {
        this.$message('请正确输入手号！');
        return;
      }
      if (this.password === '') {
        this.$message('请输入密码！');
        return;
      }
      if (this.nickName === '') {
        this.$message('请输入昵称！');
        return;
      }
      this.loadtext = '注册中...';
      this.loading = true;
      this.$http.post('/bolg/v1/users/registration', {
        phone: this.phone,
        nickname: this.nickName,
        password: this.password
      }).then((result) => {
        return this.$checkResp(result);
      }).then((result) => {
        this.activeName = 'login';
        this.loading = false;
        this.$message.success('注册成功');
      }).catch((result) => {
        this.loading = false;
        this.$message.error('注册失败');
      });
    }
  }
};
</script>

<style lang="less" scoped>
    .NotesLogin {
      display: flex;
      width: 100vw;
      height: 100vh;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(255, 255, 255, 1);

      .logoext {
        font-size: 50px;
        color: #409eff;
        transform: skewX(-30deg);
      }

      .login_register {
        width: 300px;
        height: auto;
        min-height: 300px;
        margin-top: 50px;
        border-radius: 8px;

        .elinput {
          margin-top: 20px;
        }

        .elinput:first-child {
          margin-top: 10px;
        }

        .buttonbox {
          display: flex;
          width: 100%;
          margin-top: 30px;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
      }
    }
</style>
