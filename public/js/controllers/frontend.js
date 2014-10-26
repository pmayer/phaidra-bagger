var app = angular.module('frontendApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ui.bootstrap.modal', 'ui.bootstrap.datepicker', 'ui.bootstrap.timepicker', 'ui.sortable', 'ui.select', 'ajoslin.promise-tracker', 'directoryService', 'vocabularyService', 'metadataService', 'frontendService', 'bagService', 'jobService']);

app.controller('FrontendCtrl', function($scope, $window, $modal, $log, DirectoryService, promiseTracker) {
    
	// we will use this to track running ajax requests to show spinner	
	$scope.loadingTracker = promiseTracker.register('loadingTrackerFrontend');
	
    $scope.alerts = [];        
    $scope.query = '';   
    
	$scope.initdata = '';
	$scope.current_user = '';
	
	$scope.user_settings = [];
	$scope.project_settings = [];
			
	$scope.init = function (initdata) {
		$scope.initdata = angular.fromJson(initdata);
		$scope.current_user = $scope.initdata.current_user;
		$scope.baseurl = $('head base').attr('href');
    };
    
    $scope.initSettings = function (initdata) {    
		$scope.user_settings = angular.fromJson(initdata).user_settings;
		$scope.project_settings = angular.fromJson(initdata).project_settings;
    };
                   
    $scope.forceLoadPage = function(link) {
    	$window.location = link;
    };
        
    $scope.hitEnterSearch = function(evt){    	
    	if(angular.equals(evt.keyCode,13) && !(angular.equals($scope.query,null) || angular.equals($scope.query,''))){
    		window.location = $('head base').attr('href')+'search?q='+encodeURIComponent($scope.query);
    	}
    };
    
    $scope.search = function(){    	
    	if(!(angular.equals($scope.query,null) || angular.equals($scope.query,''))){
    		window.location = $('head base').attr('href')+'search?q='+encodeURIComponent($scope.query);
    	}
    };
    
    $scope.closeAlert = function(index) {
    	$scope.alerts.splice(index, 1);
    };
    
    $scope.signin_open = function () {

    	var modalInstance = $modal.open({
            templateUrl: $('head base').attr('href')+'views/modals/loginform.html',
            controller: SigninModalCtrl
    	});
    };
    
    $scope.init = function () {
    	if($('#signin').attr('data-open') == 1){
    		$scope.signin_open();
    	}
    };
      
});

	var SigninModalCtrl = function ($scope, $modalInstance, DirectoryService, FrontendService, promiseTracker) {
		
	$scope.user = {username: '', password: ''};
	$scope.alerts = [];		
	
	// we will use this to track running ajax requests to show spinner
	$scope.loadingTracker = promiseTracker('loadingTrackerFrontend');	

	$scope.closeAlert = function(index) {
    	$scope.alerts.splice(index, 1);
    };
    
    $scope.hitEnterSignin = function(evt){
    	if(angular.equals(evt.keyCode,13) 
    			&& !(angular.equals($scope.user.username,null) || angular.equals($scope.user.username,''))
    			&& !(angular.equals($scope.user.password,null) || angular.equals($scope.user.password,''))
    			)
    	$scope.signin();
    };
    	
	$scope.signin = function () {
		
		$scope.form_disabled = true;
		
		var promise = DirectoryService.signin($scope.user.username, $scope.user.password);		
    	$scope.loadingTracker.addPromise(promise);
    	promise.then(
    		function(response) { 
    			$scope.form_disabled = false;
    			$scope.alerts = response.data.alerts;    			
    			$modalInstance.close();
    			var red = $('#signin').attr('data-redirect');
    			if(red){
    				window.location = red;
    			}else{
    				window.location.reload();
    			}
    		}
    		,function(response) {
    			$scope.form_disabled = false;
    			$scope.alerts = response.data.alerts;
            }
        );
		return;
		
	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
};



/*
app.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
});
*/
