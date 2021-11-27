// 除周六日以外的法定假期
let holidaysOrigin = [
  /********** 2021 节假日**********/
  '2021-01-01', '2021-01-02', '2021-01-03',
  '2021-02-11', '2021-02-12', '2021-02-13',
  '2021-02-14', '2021-02-15', '2021-02-16',
  '2021-02-17', '2021-04-03', '2021-04-04',
  '2021-04-05', '2021-05-01', '2021-05-02',
  '2021-05-03', '2021-05-04', '2021-05-05',
  '2021-06-12', '2021-06-13', '2021-06-14',
  '2021-09-19', '2021-09-20', '2021-09-21',
  '2021-10-01', '2021-10-02', '2021-10-03',
  '2021-10-04', '2021-10-05', '2021-10-06',
  '2021-10-07',
  /********** 2022 节假日**********/
  '2022-01-01', '2022-01-02', '2022-01-03',
  '2022-01-31', '2022-02-01', '2022-02-02',
  '2022-02-03', '2022-02-04', '2022-02-05',
  '2022-02-06', '2022-04-03', '2022-04-04',
  '2022-04-05', '2022-04-30', '2022-05-01',
  '2022-05-02', '2022-05-03', '2022-05-04',
  '2022-06-03', '2022-06-04', '2022-06-05',
  '2022-09-10', '2022-09-11', '2022-09-12',
  '2022-10-01', '2022-10-02', '2022-10-03',
  '2022-10-04', '2022-10-05', '2022-10-06',
  '2022-10-07'
]

// 除工作日以外的调休工作日
let workdaysOrigin = [
  /********** 2021 调休日**********/
  '2021-02-07', '2021-02-20', '2021-04-25',
  '2021-05-08', '2021-09-18', '2021-09-26',
  '2021-10-09',
  /********** 2022 调休日**********/
  '2022-01-29', '2022-01-30', '2022-04-02',
  '2022-04-24', '2022-05-07', '2022-10-08',
  '2022-10-09'
]

window.schedulingItem = {
  template: `
<section>
  <div v-html="styleStr"></div>

  <!--工具功能-->
  <p v-if="remainDayTips">* {{ remainDayTips }}</p>
  <!--文件载入-->
  <section class="p-input-container">
    <textarea v-model="sourceStr" class="textarea-box" :placeholder="testStr"></textarea>
    <textarea class="result-box" v-model="resultStr" readonly></textarea>
    <div class="tool-box">
      <i class="withoutZero" :class="{active:withoutZero}" @click="withoutZero=!withoutZero">去除日期补零</i>
      <i class="withoutYear" :class="{active:withoutYear}" @click="withoutYear=!withoutYear">去除年</i>
      <i class="copy" @click="copy(resultStr)">复制</i>
      <i @click="$emit('add-item')">新增排期</i>
      <i @click="$emit('delete-item')" style="background-color: #e74c3c">删除排期</i>
    </div>
  </section>
</section>
`,

  props: ['originValue'], // 初始值

  data() {
    return {
      tips: '跳过节假日的排期工具，左计划，右结果',
      timeouter: -1,
      holidays: [], // 假日列表
      workdays: [], // 工作日列表
      withoutZero: localStorage.getItem('withoutZero') === 'true', // 去除日期补零
      withoutYear: localStorage.getItem('withoutYear') === 'true', // 是否省略年份展示
      remainDayTips: '', // 剩余工期提示
      sourceStr: this.originValue || '', // 源码字符串
      testStr: `排期#起始时间：2021.12.23
排期#结束时间：2022.1.25

#自定义假期：2021.12.23,   2021.12.24， 2021.12.28
#自定义上班时间：2021.12.25

第一期
一组：
重构内容
- 注册登录
- 企业认证
- 支付渠道
时间规划
- 开发#用时：4 天
- 联调#用时：2 天
- 测试过半#用时：3 天
- 回归测试并验收#用时：4 天


############# 使用说明 #############
- 【必填】开头必须设置「起始时间」
- 【必填】每项任务用时以「换行区分」，以「#用时：数字」作为标记
- 【选填】开头选择设置排期「结束时间」，用于动态提醒，剩余可用时间
- 【选填】开头选择设置「自定义假期」，设置除法定节假日外的假期时间，将自动剔除该天的排期，以逗号或空格区分
- 【选填】开头选择设置「自定义上班时间」，将自动增加该天为上班时间，以逗号或空格区分

- 【注意】日期前的冒号，为中文冒号
- 关键字有五个，其余文案均无影响，以原文形式输出
  - #自定义假期（为了不被识别添加的文字）：2021.12.23,   2021.12.24， 2021.12.28
  - #自定义上班时间（为了不被识别添加的文字）：2021.12.25
  - #开始时间（为了不被识别添加的文字）：2022.1.18
  - #结束时间（为了不被识别添加的文字）：2022.1.18
  - #用时（为了不被识别添加的文字）：4


     `,
      resultStr: '', // 结果字符串
      styleStr: `
      <style>
      .p-input-container {
    position: relative;
    display: flex;
    margin-top: 10px;
    height: calc(100% - 60px);
  }
  .p-input-container .textarea-box, .result-box {
    height: 100%;
    flex: 1;
    position: relative;
    display: flex;
    white-space: pre;
    text-align: left;
    color: #333333;
    vertical-align: text-top;
    font-size: 14px;
    overflow: auto;
    border-radius: 4px;
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  }
  .textarea-box {
    margin-right: 20px;
    padding: 12px;
    border: 1px solid #cccccc;
    resize: none;
  }
  .result-box {
    padding: 12px;
    display: block;
    border: 1px solid #bbbbbb;
  }
  .tool-box {
    position: absolute;
    top: -34px;
    right: 0;
    text-align: right;
  }
  i {
    display: inline-block;
    padding: 4px 8px;
    font-size: 14px;
    color: white;
    cursor: pointer;
    border-radius: 4px;
    border: 1px solid #aaaaaa;
    background-color: #3D8AC7;
    opacity: 0.7;
    transition: 0.3s all;
  }
  i:hover, .active {
    opacity: 1;
  }
  </style>
      `,
    }
  },

  watch: {
    sourceStr: function(newValue) {
      this.resultStr = this.parseData(newValue || this.testStr)
    },
    withoutYear: function(newValue) {
      localStorage.setItem('withoutYear', newValue)
      this.resultStr = this.parseData(this.sourceStr || this.testStr)
    },
    withoutZero: function(newValue) {
      localStorage.setItem('withoutZero', newValue)
      this.resultStr = this.parseData(this.sourceStr || this.testStr)
    },
  },

  mounted() {
    console.log('originValue', this.originValue)
    this.resultStr = this.parseData(this.testStr)
  },

  methods: {

    // 格式化时间
    formatTime(date, formatStr, withoutZero) {
      const formatType = {
        Y: date.getFullYear(),
        M: date.getMonth() + 1,
        D: date.getDate(),
        h: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
      }
      return formatStr.replace(
        /Y+|M+|D+|h+|m+|s+/g,
        target => ((withoutZero ? '' : new Array(target.length).join('0')) + formatType[target[0]]).substr(-target.length)
      )
    },

    // 判断传入日期是否为法定假期
    isHoliday(targetDate) {
      // 判断除周六日外的法定节假日
      if (this.holidays.indexOf(this.formatTime(targetDate, 'YYYY-MM-DD')) > -1) {
        return true
      }
      // 判断除工作日外的调休工作日
      if (this.workdays.indexOf(this.formatTime(targetDate, 'YYYY-MM-DD')) > -1) {
        return false
      }
      // 判断周六日
      return targetDate.getDay() === 6 || targetDate.getDay() === 0
    },

    // 获取工期有效时间
    getValidDays(projectStartDate, projectEndDate) {
      let allDays = (projectEndDate.getTime() - projectStartDate.getTime()) / 1000 / 60 / 60 / 24 + 1
      let checkDayIndex = projectStartDate // 需要校验的日期
      for (let i = 0, all = allDays; i < all; i++) {
        if (this.isHoliday(checkDayIndex)) {
          allDays--
        }
        checkDayIndex.setDate(checkDayIndex.getDate() + 1)
      }
      return allDays
    },

    // 添加自定义假期，自定义上班时间
    addCustomHolidayAndWorkday(originStr) {
      if (originStr.match(/#自定义假期：(\d+[./\-]\d+[./\-]\d+)/)) {
        let targetLine = originStr.match(/#自定义假期：((\d+[./\-]\d+[./\-]\d+)[,， ]*)+/ig)[0]
        this.holidays = [...holidaysOrigin, ...targetLine.match(/(\d+[./\-]\d+[./\-]\d+)/ig)]
      } else {
        this.holidays = [...holidaysOrigin]
      }
      if (originStr.match(/#自定义上班时间：(\d+[./\-]\d+[./\-]\d+)/)) {
        let targetLine = originStr.match(/#自定义上班时间：((\d+[./\-]\d+[./\-]\d+)[,， ]*)+/ig)[0]
        this.workdays = [...workdaysOrigin, ...targetLine.match(/(\d+[./\-]\d+[./\-]\d+)/ig)]
      } else {
        this.workdays = [...workdaysOrigin]
      }
      // 兼容时间格式分隔符，统一转化为 横杠区分
      this.holidays = JSON.parse(JSON.stringify(this.holidays).replace(/[./\-]/g, '-'))
      this.workdays = JSON.parse(JSON.stringify(this.workdays).replace(/[./\-]/g, '-'))
      // console.log('this.holidays', this.holidays)
      // console.log('this.workdays', this.workdays)
    },

    // 计算日历时间
    parseData(originStr) {
      // 添加自定义假期和工作日
      this.addCustomHolidayAndWorkday(originStr)

      // 校验是否输入了「项目开始时间」
      if (!originStr.match(/#起始时间：(\d+[./\-]\d+[./\-]\d+)/)) {
        return '请输入项目起始时间，示例如：xxx #起始时间：2021.12.23'
      }

      // 项目开始时间
      let projectStartDate = originStr.match(/#起始时间：(\d+[./\-]\d+[./\-]\d+)/)[1]
      // 项目期望结束时间
      let projectEndDate = null
      // 获取总有效工期
      let validDays = -1
      // 剩余有效工期
      let remainDays = -1
      // 有输入项目期望结束时间
      if (originStr.match(/#结束时间：(\d+[./\-]\d+[./\-]\d+)/)) {
        projectEndDate = originStr.match(/#结束时间：(\d+[./\-]\d+[./\-]\d+)/)[1]
        validDays = remainDays = this.getValidDays(new Date(projectStartDate), new Date(projectEndDate))
      }

      // 下一项任务的起始时间
      let nextItemStartDate = new Date(projectStartDate)
      // 获取时间分隔符
      let splitKey = projectStartDate.match(/[^\d]/)[0]

      let resultStr = originStr.split('\n').map(line => {
        // 计算当前任务时间
        if (line.match(/#用时：(\d+)/)) {

          // 计算开始时间是否为可用时间
          for (let i = 0; i < 30; i++) {
            // 跳过周六日，及法定假期
            if (!this.isHoliday(nextItemStartDate)) {
              break;
            }
            nextItemStartDate.setDate(nextItemStartDate.getDate() + 1)
          }

          let itemStartDate = new Date(nextItemStartDate) // 单项任务开始时间
          let nextDate = new Date(nextItemStartDate) // 单项任务开始时间的下一天
          let needDate = line.match(/#用时：(\d+)/)[1] // 单项任务所需时间
          remainDays -= needDate // 从剩余工期天数中，减去该项任务所需时间

          // 遍历耗时中的每一天，跳过周六日和假期，补上调休时间
          for (let i = 1; i < needDate; i++) {
            nextDate.setDate(nextDate.getDate() + 1)
            // 跳过周六日，及法定假期
            if (this.isHoliday(nextDate)) {
              i--
            }
          }

          // 设置下一个任务的开发时间
          nextItemStartDate = new Date(nextDate)
          nextItemStartDate.setDate(nextItemStartDate.getDate() + 1)

          // 在原任务字符串中，在最后添加该项任务的起始时间
          return line + (`(${this.formatTime(itemStartDate, this.withoutYear ? `MM${splitKey}DD` : `YYYY${splitKey}MM${splitKey}DD`, this.withoutZero)}~${this.formatTime(nextDate, this.withoutYear ? `MM${splitKey}DD` : `YYYY${splitKey}MM${splitKey}DD`, this.withoutZero)})`)
        } else {
          return line
        }
      }).join('\n')

      // 如果输入了期望结束时间，则添加可用工时字段
      this.remainDayTips = ''
      if (projectEndDate) {
        this.remainDayTips = `总可用工时：${validDays}；已使用工时：${validDays - remainDays}；剩余可用工时：${remainDays}`
      }
      return resultStr
    },

    // 拷贝结果
    copy() {
      clearTimeout(this.timeouter)
      this.tips = `复制成功`
      this.timeouter = setTimeout(() => {this.tips = `跳过节假日的排期工具，左计划，右结果`}, 1000)
      if (!document.queryCommandSupported('copy')) {
        return false
      }

      let $input = document.createElement('textarea')
      $input.style.opacity = '0'
      $input.value = this.resultStr
      document.body.appendChild($input)
      $input.select()

      document.execCommand('copy')
      document.body.removeChild($input)
      $input = null
    }
  },
}
