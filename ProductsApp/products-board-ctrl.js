ilc.web.inheritController('productsBoardCtrl', ['$scope', '$sessionStorage', '$filter', '$timeout', 
function ($scope, $sessionStorage, $filter, $timeout) {
    $scope.model = {
        instanceId: $scope.instanceId,
        items: [],
        itemsBacklog: [],
        canLoad: false,
        isAjaxInProgress: true,
        selectedIndex: -1,
        timeoutIsSet: false,
        getSelectedIndex: false,

        //sets the default property the list items are ordered by
        orderBy: 'Value.Name',

        loadMore: function () {
            if ($scope.model.itemsBacklog.length > 0) {
                var max = 30;
                max = $scope.model.itemsBacklog.length > max ? max : $scope.model.itemsBacklog.length;
                for (var i = 0; i < max; i++) {
                    $scope.model.items.push($scope.model.itemsBacklog[i]);
                }
                $scope.model.itemsBacklog.splice(0, max);
                $scope.model.calcLoad();
            }
        },

        calcLoad: function () {
            $scope.model.canLoad = ($scope.model.itemsBacklog.length > 0);
        },
    };

    $scope.ilc.onNewInformation(function (data) {
        //This function is called when new information arrives
        ilc.web.apply($scope, function () {
            //The latest selected detail item is stored in $sessionStorage to select this item again after a reset
            if ($sessionStorage.selectedDetailsItem && $sessionStorage.selectedDetailsItem.ValueId === data.ValueId) {
                //show stored item in detail view
                $scope.common.selectItemOnce(data);
                $scope.model.getSelectedIndex = true;
            }

            if (!$sessionStorage.selectedDetailsItem && !$scope.model.timeoutIsSet){
                $scope.model.timeoutIsSet = true;
                $timeout($scope.selectFirstItem, 300);
            }
            
            if($scope.model.items.length < 30)
                $scope.model.items.push(data);
            else{
                $scope.model.itemsBacklog.push(data);
                $scope.model.getSelectedIndex = false;
            }

            if ($scope.model.getSelectedIndex) {
                //Get the index of stored detail item in sorted items list
                $scope.model.selectedIndex = _.findIndex($filter('orderBy')($scope.model.items, $scope.model.orderBy, false),
                    function (item) { return item.ValueId === $sessionStorage.selectedDetailsItem.ValueId; })
            }
            $scope.model.isAjaxInProgress = false;
            $scope.model.calcLoad();
        });
    });

    $scope.selectFirstItem = function(){
        if ($scope.model.items.length != 0){
            var firstItem = ($filter('orderBy')($scope.model.items, $scope.model.orderBy, false))[0];
            $scope.common.showDetails(firstItem);
            $scope.model.selectedIndex = 0;
        }
    };
    
    $scope.ilc.onChangedInformation(function (data) {
        //This function is called when existing informations have been changed (i.e. the information have been expanded by another harvester)
        ilc.web.apply($scope, function () {
            var item = _.find($scope.model.itemsBacklog, function (x) { return x.Id === data.Id; });
            if (typeof item === "undefined") {
                item = _.find($scope.model.items, function (x) { return x.Id === data.Id; });
            }
            if (typeof item === "undefined") {
                return;
            }

            if (item === $scope.model.detailItem) {
                item.Value = data.Value;
                $scope.model.detailItem = item;
                ilc.messenger.notifySelectedItemUpdate($scope.model.instanceId, item);
            } else {
                item.Value = data.Value;
            }
            $scope.model.isAjaxInProgress = false;
        });
    });

    $scope.ilc.onResetInformations(function () {
        ilc.web.apply($scope, function () {
            $scope.model.items = [];
            $scope.model.itemsBacklog = [];
            $scope.model.canLoad = false;
            $scope.model.detailItem = undefined;
            $scope.model.selectedIndex = -1;
            $scope.model.isAjaxInProgress = false;
            $scope.model.getSelectedIndex = false;
            $scope.model.timeoutIsSet = false;
            $scope.common.selectItemOnce();
        });
    });
}]);
