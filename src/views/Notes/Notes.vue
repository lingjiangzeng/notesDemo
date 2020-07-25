<template>
    <!--  notes 是当前页面 root标签 -->
    <div class="notes">
        <!-- noteslist  左边笔记列表内容框 添加笔记按钮-->
        <div class="noteslistBox">
            <!-- addnotes 添加笔记按钮 -->
            <div class="addnotes">
                <el-input placeholder="请输入标题搜索" @input="searchnotesfun($event)" class="searchnotes" :clearable="true">
                    <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                 <el-button type="primary" icon="el-icon-plus" @click="addNotes()">添加笔记</el-button>
             </div>
             <!-- noteslist  笔记列表-->
             <div class="noteslist" v-loading="loading">
                <!-- notestabtime 笔记选项卡 使用 v-for 遍历渲染-->
                <div :class="{notestab:true,notestabactive:openNotesID == items.id}" v-for="(items,index) in NotesList" :key="'notestabtime' + index" >
                  <div class="notestabtime ">
                      <!-- 笔记日期-->
                      <span>日期:<span>{{ items.time }}</span></span>
                      <el-tooltip placement="left-start" effect="light">
                        <div slot="content" class="notesediting">
                          <!-- 编辑选项-->
                          <span class="edit" @click="editnotesFun(items)"><i class="el-icon-edit"></i><span>编辑</span></span>
                           <span class="delete" @click="deleteNoteFun(items,index)"><i class="el-icon-delete"></i><span>删除</span></span>
                        </div>
                        <!--更过操作图标 使用hover 弹出 编辑选项 -->
                        <i class="el-icon-menu"></i>
                      </el-tooltip>
                  </div>
                  <!-- 笔记标题-->
                  <div class="notestabtitle" :title="items.title"><span>标题:</span><span>{{ items.title }}</span></div>
                </div>
             </div>
        </div>
            <!-- notestextareabox  右边文本编辑框-->
            <!-- 笔记标题输入框、日期选择框、关闭、保存 布局内容-->
        <div class="notestextareabox" v-show="showNotesTextareaBox">
            <div class="topbuttom">
                <div class="notestitle_time">
                    <span>标题</span>
                    <el-input v-model="notesTitleValue" placeholder="请输入标题" size="small" class="notestitle" @input="titleChange()"></el-input>
                </div>
                <div class="notestitle_time">
                    <span>日期</span>
                     <el-date-picker
                        class="notestime"
                        size="small"
                        v-model="notesTimeValue"
                        @change="timeChange()"
                        type="date"
                        format="yyyy 年 MM 月 dd 日"
                        value-format="yyyy 年 MM 月 dd 日"
                        placeholder="选择日期">
                    </el-date-picker>
                </div>
                <el-button type="danger" size="mini" class="close" @click="cancelEdit()">关闭</el-button>
                <el-button type="primary" size="mini" class="save" v-if="changContent" @click="verifySaveContent()">保存</el-button>
            </div>
            <quill-editor
                class="notestextarea"
                v-model="content"
                ref="myQuillEditor"
                :options="editorOption"
                @change="onEditorChange($event)">
            </quill-editor>
        </div>
    </div>
</template>
<script>
/* 此处引入 vue-quill-editor 插件和插件样式,只为当前组件页使用，不是全局使用 */
import { quillEditor } from 'vue-quill-editor';
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';
export default {
  name: 'Notes',
  components: {
    quillEditor
  },
  data() {
    return {
      /* 笔记列表数据 */
      NotesList: [],
      /* 所打开的笔记列表id 没有打开或添加笔记时 为空字符串 */
      openNotesID: '',
      /* 是否显示富文本编辑框
       有两种情况；
        1、showNotesTextareaBox 值为true notesTitleValue 值为空字符串时 是添加笔记
        2、showNotesTextareaBox 值为true notesTitleValue 值部为空字符串时 是编辑笔记
      */
      showNotesTextareaBox: false,
      /* 笔记标题 没有打开或添加笔记时 为空字符串 */
      notesTitleValue: '',
      /* 笔记日期 没有打开或添加笔记时 为空字符串 */
      notesTimeValue: '',
      /* 文本编辑的内容 */
      content: '',
      /* vue-quill-editor 插件的一些配置参数 */
      editorOption: {
        placeholder: '请输入笔记',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            ['blockquote', 'code-block'],
            [{ 'header': 1 }, { 'header': 2 }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }]
          ]
        }
      },
      /* 判断是否有编辑过内容  默认没有 */
      changContent: false,
      /* openNotesID */
      changOpenNotesID: false,
      /* 设置一个存储定时器的对像 */
      setTimeoutObj: null,
      /* 搜索加载 */
      loading: false
    };
  },
  mounted() {
    /* 获取用户信息 */
    this.$http.post('/bolg/v1/users/sessions');
    // vue 对组合键方法支持不好（ctrl + S）所以 在这使用了原生js写了方法
    let _that = this;
    document.onkeydown = function(event) {
      if (_that.showNotesTextareaBox) {
        if (event.ctrlKey === true && event.code === 'KeyS') {
          _that.verifySaveContent();
          event.preventDefault();
        }
      }
    };
    // 调用初始化方法
    this.init();
  },
  watch: {
    openNotesID: function(news, olds) {
      this.changOpenNotesID = true;
      setTimeout(() => {
        this.changOpenNotesID = false;
      }, 500);
    }
  },
  methods: {
    // 页面加载完成优先调用的方法 如果sessionStorage 缓存中没有 notesList 则创建一个，有则把数据添加到 this.this.NotesList 中
    init: function() {
      sessionStorage.getItem('notesList') ? this.NotesList = JSON.parse(sessionStorage.getItem('notesList')) : sessionStorage.setItem('notesList', '[]');
    },
    /*
    监听搜索框ss输入
    @params String value
    */
    searchnotesfun: function(value) {
      if (this.setTimeoutObj == null) {
        this.getSearchData(value);
      } else {
        clearTimeout(this.setTimeoutObj);
        this.getSearchData(value);
      }
    },
    // 富文本改变时触发 设置 this.changContent 值为true, 保存后设置为 false,
    onEditorChange: function() {
      this.setchangContent();
    },
    // 标题改变时触发 设置 this.changContent 值为true, 保存后设置为 false,
    titleChange: function() {
      this.setchangContent();
    },
    // 日期改变时触发 设置 this.changContent 值为true, 保存后设置为 false,
    timeChange: function() {
      this.setchangContent();
    },
    // 设置 this.changContent 值为true, 保存后设置为 false,
    setchangContent: function() {
      if (!this.changContent && !this.changOpenNotesID) {
        this.changContent = true;
      }
    },
    // 监听title input 框man
    // 打开笔记编辑
    editnotesFun: function(items) {
      this.changContent = false; // 打开笔记默认没有编辑过
      this.showNotesTextareaBox = true; // 显示编辑框
      this.notesTitleValue = items.title;// 回显标题
      this.notesTimeValue = items.time;// 回显日期
      this.openNotesID = items.id;// 记录选中 的openNotesIDss
      this.content = this.getNotesContent(items.id);// 回显文本域的内容
    },
    // 删除笔记
    deleteNoteFun: function(items, index) {
      // 先判断要删除的笔记是否是打开了编辑， 是则给出提示，不是直接删除
      if (items.id === this.openNotesID) {
        this.$notify.error({ title: '错误', message: '不能删除正在编辑中的笔记！' });
      } else {
        this.$confirm('确定要删除笔记？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.affirmdeleteNote(index);
        }).catch(() => {});
      }
    },
    /*  删除笔记操作 */
    affirmdeleteNote: function(items, index) {
      // 删除sessionStorage 中 notesList 对应的子元素
      sessionStorage.getItem('notesList');
      let notesListarr = JSON.parse(sessionStorage.getItem('notesList'));
      notesListarr.splice(index, 1);
      sessionStorage.setItem('notesList', JSON.stringify(notesListarr));
      sessionStorage.removeItem(items.id);
      this.init();
    },
    /*
      添加笔记有两种情况
        1、没有打开编辑框时，将会打开编辑编辑框 标题、日期、 和富文本的内容都为空字符串
        2、 打开编辑框时，openNotesID、notesTitleValue、notesTimeValue、content  清空设置为字符串
    */
    addNotes: function() {
      this.openNotesID = '';// 清除选中 的openNotesIDss
      this.showNotesTextareaBox = true; // 显示笔记编辑
      this.notesTitleValue = '';// 清除标题
      this.notesTimeValue = '';// 清除日期
      this.content = '';// 清除文本域的内容
      this.changContent = false; // 添加笔记 默认为没有编辑
    },
    // 关闭编辑的内容 使用 this.changContent 判断 内容有没有更改，有则直接弹出提示，没有则直接关闭。
    cancelEdit: function() {
      if (this.changContent) {
        this.$confirm('关闭将不会保存编辑的内容，确定要关闭吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.clearContent();
        }).catch(() => {});
      } else {
        this.clearContent();
      }
    },
    verifySaveContent: function() {
      // 为什么判断null? 因为element-UI 日期点击清除后绑定值为null
      if (this.notesTitleValue === '' || this.notesTitleValue === null) {
        this.$notify.error({ title: '错误', message: '请添加标题！' });
      } else if (this.notesTimeValue === '' || this.notesTimeValue === null) {
        this.$notify.error({ title: '错误', message: '请选择日期' });
      } else {
        this.saveContent();
      }
    },
    // 保存编辑的内容
    saveContent: function() {
      // 使用this.openNotesID 判断保存的笔记是新添加的还是重新编辑
      if (this.openNotesID === '') { // 保存新添加笔记
        let obj = {};
        obj.id = this.createId();
        obj.title = this.notesTitleValue;
        obj.time = this.notesTimeValue;
        this.saveContentToSessionStorage(obj);
        sessionStorage.setItem(obj.id, this.content);
      } else if (this.openNotesID !== '' && this.changContent) { // 保存重新编辑的笔记
        // 更新编辑的文档
        let notesListarr = JSON.parse(sessionStorage.getItem('notesList'));
        notesListarr.forEach((value, index) => {
          if (value.id === this.openNotesID) {
            value.title = this.notesTitleValue;
            value.time = this.notesTimeValue;
          }
        });
        sessionStorage.setItem('notesList', JSON.stringify(notesListarr));
        this.init();
        sessionStorage.setItem(this.openNotesID, this.content);
        this.changContent = false;
        this.$notify({ title: '成功', message: '笔记已经保存成功！', type: 'success' });
      }
    },
    /*
     需要对一些数据做清空恢复初始值
    */
    clearContent: function() {
      this.showNotesTextareaBox = false;// 关闭编辑框
      // 清除笔记后将清除编辑的内容不做保存（是添加笔记将不做存储、是编辑原有笔记时将不会更新内容）
      this.notesTitleValue = '';// 清除标题
      this.notesTimeValue = '';// 清除日期
      this.content = '';// 清除文本域的内容
      this.openNotesID = '';// 清除选中 的openNotesID
    },
    /*
    存储新的笔记数据到sesstionStorage 缓存
    @params Object obj
    */
    saveContentToSessionStorage: function(obj) {
      let notesListarr = JSON.parse(sessionStorage.getItem('notesList'));
      notesListarr.unshift(obj);
      sessionStorage.setItem('notesList', JSON.stringify(notesListarr));
      this.init();
      this.openNotesID = obj.id;
      // 保存后  设置 this.changContent = true;
      this.changContent = false;
      this.$notify({ title: '成功', message: '笔记已经保存成功！', type: 'success' });
    },
    /*
    查找数据session 上的笔记数据 在返回数据
    @params String  openNotesID
    return  Object
    */
    getNotesContent: function(openNotesID) {
      return sessionStorage.getItem(openNotesID);
    },
    /*
      添加笔记创建 笔记 id (openNotesID)
      return  String
    */
    createId: function() {
      let D = new Date();
      let year = D.getFullYear();
      let month = D.getMonth();
      let day = D.getDate();
      let hours = D.getHours();
      let miunte = D.getMinutes();
      let seconds = D.getSeconds();
      let Millisecondss = D.getMilliseconds();
      return year + '-' + month + '-' + day + '-' + hours + '-' + miunte + '-' + seconds + '-' + Millisecondss;
    },
    /* 实现搜索回显示
    @params String  value
    */
    getSearchData: function(value) {
      this.loading = true;
      if (value === '') {
        this.init();
        this.loading = false;
      } else {
        this.setTimeoutObj = setTimeout(() => {
          this.NotesList = JSON.parse(sessionStorage.getItem('notesList')).filter((obj) => obj.title.indexOf(value) > -1);
          this.loading = false;
        }, 300);
      }
    }
  }
};
</script>
<style lang="less" scoped>
  .notesediting {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 50px;
    height: 40px;
    cursor: pointer;

    .edit:hover {
      color: rgba(64, 158, 255, 1);
    }

    .delete:hover {
      color: rgba(245, 108, 108, 1);
    }
  }

  .notes {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    .noteslistBox {
      width: 400px;
      height: 100%;
      background: rgba(255, 255, 255, 1);
      border-right: 1px solid #ccc;

      .addnotes {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        height: 80px;
        font-size: 20px;
      }

      .searchnotes {
        width: 250px;
      }

      .noteslist {
        display: flex;
        flex-flow: wrap;
        flex-direction: row;
        justify-content: flex-start;
        align-items: flex-start;
        align-content: flex-start;
        height: calc(100% - 80px);
        padding-bottom: 8px;
        overflow-x: hidden;
        overflow-y: auto;
        box-sizing: border-box;
        flex-grow: 2;

        .notestab {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          align-items: flex-start;
          width: 180px;
          height: 80px;
          min-width: 180px;
          min-height: 80px;
          margin-top: 10px;
          margin-left: 13px;
          cursor: pointer;
          background: rgba(255, 255, 255, 1);
          border-radius: 8px;
          box-shadow: 0.1px 8px 16px 0.1px rgba(235, 235, 235, 0.8);
          transition: all 0.1s ease-in 0s;
        }

        .notestabactive {
          background: rgba(64, 158, 255, 0.15);
          transform: scale(1.05);
        }

        i:hover {
          color: rgba(64, 158, 255, 1);
        }

        .notestabtime {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          width: calc(100% - 20px);
          margin-left: 10px;
          font-size: 12px;
          color: rgba(150, 159, 170, 1);
        }

        .notestabtitle {
          display: block;
          width: 80%;
          margin-left: 10px;
          overflow: hidden;
          font-size: 14px;
          font-weight: 550;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .notestab:hover {
          background: rgba(64, 158, 255, 0.15);
          transform: scale(1.05);
        }
      }

      .noteslist::-webkit-scrollbar {
        width: 4px;
      }

      .noteslist::-webkit-scrollbar-thumb {
        background: rgba(214, 214, 214, 1);
        border-radius: 4px;
      }
    }

    .notestextareabox {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      width: calc(100% - 400px);
      height: 100%;

      .topbuttom {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        align-items: center;
        width: 100%;
        height: 54px;

        .save {
          margin-left: 20px;
        }

        .close {
          margin-left: 20px;
        }

        .notestitle_time {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          margin-left: 20px;
        }

        .notestitle {
          width: 200px;
          margin-left: 10px;
        }

        .notestime {
          width: 200px;
          margin-left: 10px;
        }
      }

      .notestextarea {
        width: calc(100% + 2px);
        height: calc(100% - 15px);
        min-width: calc(100% + 2px);
        margin-left: -1px;
        overflow: hidden;
      }
    }
  }
</style>
