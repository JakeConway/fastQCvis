/**
 * Created by jakeconway on 5/17/16.
 */

function groupsFunctions(){

    var groups = $("#selected-groups").val();
    var IDs = [];
    var group_data = {};

    for (var i = 0; i < groups.length; i++) {
        IDs.push($("#selected-groups").select2('data')[i]['text'])
        group_data[IDs[i]] = groups[i];
    }


    for (var i = 0; i < IDs.length; i++){
        if (groupData[IDs[i]] == undefined){
            var groupfiles = group_data[IDs[i]].split(",");
            generateGroupData(groupfiles);
        }
    }

}

function generateGroupData(files){
    //Functions to break up files for group visualizations
}