 
 
# ducr-cli

### 介绍
一个可自定义快速搭建项目的cli，可指定下载GitHub中代码仓库的branch或tag。

## 命令介绍
### 创建项目
输入项目命令后进行输入项目名称，选择项目模版，选择项目版本，回车后即可
```
ducr-cli create <project-name>
```
### 自定义代码仓库创建项目
输入项目命令后进行输入项目名称，选择项目模版，选择项目版本，回车后即可
```
ducr-cli create <project-name> [-o | --owner github-owner] [-r | --repository repository-name]
```
### 强制创建文件
此时将不检测当前创建文件目录中是否存在同名的文件夹，将会直接移除进行创建先的项目
```
mfy-cli create [project-name] -f
```
