import {Component, OnInit} from '@angular/core';
import 'codemirror/mode/sql/sql.js';
import 'codemirror/addon/hint/sql-hint.js';
import * as CodeMirror from "codemirror";
import 'codemirror/addon/selection/active-line.js'
import 'codemirror/addon/edit/closebrackets.js'
import {SqlLabServicesService} from "../../services/sqlLab/sql-lab-services.service";
import {SqlJobModel} from "../../model/sql-job-model";
import {ClusterConfigs} from "../../model/clusterConfigs";
import {JobConfigModel} from "../../model/jobConfigModel";


@Component({
  selector: 'app-sql-edit',
  templateUrl: './sql-edit.component.html',
  styleUrls: ['./sql-edit.component.css']
})
export class SqlEditComponent implements OnInit {

  cmOptions: any;
  logContent: any;
  logOptions: any;
  sqlJobModule: SqlJobModel = new SqlJobModel();
  jobConfig: any = new JobConfigModel();
  jobConfigMap: Map<String, JobConfigModel> = new Map<String, JobConfigModel>();
  clusterConfigs: ClusterConfigs = new ClusterConfigs();
  jobConfigList: Array<Map<String, String>> = [];

  constructor(private sqlLabSer: SqlLabServicesService) {
  }

  ngOnInit(): void {
    this.jobInit();
    this.codeMirrorInit();
    this.jobConfig = new JobConfigModel();
  }

  private jobInit() {
    this.sqlLabSer.getClusterConfigList().then((clusterConfigs: any) => {
      //load cluster, model, catalog configs
      if (clusterConfigs.status === 200) {
        this.clusterConfigs = clusterConfigs.result;
      } else {
        console.dir("load cluster metadata fail. please retry or check backEnd service is health");
        alert("load cluster metadata fail. please retry or check backEnd service is health");
      }

  //load jobConfigs
  this.jobConfigInit();
    });

    console.dir(this.clusterConfigs)

  }

  private jobConfigInit() {
    this.sqlLabSer.getJobConfigList().then((result: any) => {
      if (result.status === 200) {
        this.clusterConfigs.jobConfigList = result.result;
        this.clusterConfigs.jobConfigList.forEach(jobConf => {
          this.jobConfigMap.set(jobConf.configname, jobConf);
        })
      } else {
        alert("load jobConfig fail:" + result.desc);
      }
    });
  }

  private codeMirrorInit() {
    this.sqlJobModule.sqlScript = "o_< enjoy you sql tour... ";
    this.cmOptions = {
      /* mode: "text/x-mysql",
       // ????????????
       tabSize: 1,
       // ???????????????????????? JS ??????????????????
       // theme: 'zenburn',
       // ????????????
       lineNumbers: true,
       line: true,
       lineWrapping: true,  // ????????????
       styleActiveLine: true, // ?????????????????????
       smartIndent: true,
       indentUnit: 4,  // ???????????????4
       extraKeys: { Ctrl: "autocomplete" }, //??????????????????*/
      mode: 'text/x-mysql',//?????????????????????????????????????????????????????????????????????????????????????????????????????????
      smartIndent: true,
      indentUnit: 4,
      autoRefresh: true,
      tabSize: 2,
      indentWithTabs: true,
      lineNumbers: true,
      matchBrackets: true,	//????????????
      styleActiveLine: true,  // ?????????????????????
      // line: true,
      // theme: 'base16-light',
      autofocus: true,
      hint: CodeMirror.hint.sql,
      // cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      hintOptions: {
        function(cm: any, event: any) {
          //??????????????????'$','{','.'??????????????????????????????????????????
          if (!cm.state.completionActive &&
            ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 52 || event.keyCode == 219 || event.keyCode == 190)) {
            CodeMirror.commands.autocomplete(cm, undefined, {completeSingle: false});
          }
        }
      },
      lineWrapping: true,         //????????????
      foldGutter: true,           //????????????
    };

    //???????????????????????????????????????cursorActivity??????????????????change??????????????????????????????????????????????????????
    /*    this.editor.on("keyup", function (cm, event) {
          //??????????????????'$','{','.'??????????????????????????????????????????
          if (!cm.state.completionActive &&
            ((event.keyCode >= 65 && event.keyCode <= 90 ) || event.keyCode == 52 || event.keyCode == 219 || event.keyCode == 190)) {
            CodeMirror.commands.autocomplete(cm, null, {completeSingle: false});
          }
        });*/

    this.logContent = "";
    this.logOptions = {
      mode: 'XML/HTML',
      smartIndent: true,
      indentUnit: 4,
      autoRefresh: true,
      tabSize: 2,
      indentWithTabs: true,
      lineNumbers: true,
      matchBrackets: true,	//????????????
      styleActiveLine: true
    };
  }

  executorSql(jobModel: SqlJobModel) {

     this.sqlLabSer.executorSqlTask(jobModel).then((result: any) => {
       if (result.statusCode != 200) {
         alert("executor job failed!\n cause by: " + result.desc);
       }
       console.dir(result);
     });
  }

  onFocus() {
    // alert("onFocus")
  }

  onBlur() {
    // alert("onBlur")
  }

  editConfigs() {
    alert("goto edit config templates");
  }

  isOutput(isOutputLog: boolean) {
    this.sqlJobModule.isOutputLog = !isOutputLog;
  }

  setCluster(event: Event) {
    const clusterName = (<HTMLSelectElement>event.target).value;
    console.log(clusterName);
    this.sqlJobModule.cluster = clusterName;
  }

  setModule(event: Event) {
    const jobType = (<HTMLSelectElement>event.target).value;
    console.log(jobType);
    this.sqlJobModule.jobType = jobType;
  }

  setCatalog($event: Event) {
    const catalogName = (<HTMLSelectElement>$event.target).value;
    console.log(catalogName);
    this.sqlJobModule.catalog = catalogName;
  }

  setTableName($event: Event) {
    const tableName = (<HTMLSelectElement>$event.target).value;
    console.log(tableName);
    this.sqlJobModule.table = tableName;
  }

  selectJobConfig(event : Event) {

    let configName : String = (<HTMLSelectElement>event.target).value;
    console.log(configName);
    this.jobConfig = this.jobConfigMap.get(configName);
    console.dir(this.jobConfig);
    this.sqlJobModule.configuration = this.jobConfig;
  }

  addJobConfig(jobConfig: JobConfigModel) {
    this.jobConfigMap.set(jobConfig.configname, jobConfig);
    this.sqlLabSer.addJobConfig(jobConfig).then((result: any) => {
      if (result.statusCode != 200) {
        alert("addJobConfig failed! cause by: " + result.desc);
      } else {
        // this.jobConfigInit();
        this.jobConfigMap.set(jobConfig.configname, jobConfig);
      }
      console.log(result.desc);
    });
  }

  newConfig(jobConfig: any) {
    this.jobConfig = new JobConfigModel();
  }

  selectRestartStrategy($event: Event) {
    let restartstrategy = (<HTMLSelectElement>$event.target).value;
    console.log(restartstrategy);
    this.jobConfig.restartstrategy = restartstrategy;
  }
}
