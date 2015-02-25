ilc.web.controller('companiesDetailsCtrl', ['$scope', function ($scope) {
    $scope.model = {
        getGoogleMapsUrl : function() {
            var url = 'http://maps.google.com/maps?q=';
            //the current detail item can be accessed via $scope.item;
            var address = $scope.item.Value.Addresses[0];
            url += address.Address + address.Zip + address.City;
            return url;
        },
        
    };
}]);