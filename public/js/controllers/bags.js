
app.controller('BagsCtrl',  function($scope, $modal, $location, DirectoryService, BagService, FrontendService, promiseTracker, Url) {

// we will use this to track running ajax requests to show spinner
	$scope.loadingTracker = promiseTracker('loadingTrackerFrontend');

	$scope.alerts = [];

	$scope.selection = [];

	$scope.items = [];
	$scope.itemstype = '';

	$scope.members = [];

	$scope.initdata = '';
	$scope.current_user = '';
	$scope.folderid = '';

  $scope.totalItems = 0;
  $scope.currentPage = 1;
  $scope.maxSize = 10;
  $scope.filter = '';
  $scope.from = 0;
  $scope.limit = 10;
  $scope.sortfield = 'label';
  $scope.sortvalue = -1;

	$scope.init = function (initdata) {
		$scope.initdata = angular.fromJson(initdata);
		$scope.current_user = $scope.initdata.current_user;
		$scope.folderid = $scope.initdata.folderid;

		$scope.filter = {
		    // show only bags in these statuses
		    status: ['new','to_check','checked','to_ingest']
		};

		if($scope.folderid){
				$scope.filter['folderid'] = $scope.folderid;
		}

		if($scope.initdata.query){
			$scope.filter = $scope.initdata.query.filter;
			$scope.from = $scope.initdata.query.from;
			$scope.limit = $scope.initdata.query.limit;
			$scope.sortfield = $scope.initdata.query.sortfield;
			$scope.sortvalue = $scope.initdata.query.sortvalue;
		}

		$scope.refreshResults();

  	if($scope.current_user){
  		$scope.loadSelection();
  	}

  };

    $scope.closeAlert = function(index) {
    	$scope.alerts.splice(index, 1);
    };

	$scope.setLimit = function(limit){
			$scope.limit = limit;
			$scope.refreshResults();
	}

	$scope.getBagUrlWithQuery = function (bagid) {
		var url = $('head base').attr('href')+'bag/'+bagid+'/edit';
		var params = {
			filter: $scope.filter,
			from: $scope.from,
			limit: $scope.limit,
			sortfield: $scope.sortfield,
			sortvalue: $scope.sortvalue
		};
		//return url+'?'+ $scope.qs(params, null);
		return Url.buildUrl(url, params);
	};

    $scope.selectNone = function(event){
    	$scope.selection = [];
    	$scope.saveSelection();
    };

    $scope.selectVisible = function(event){
    	$scope.selection = [];
    	for( var i = 0 ; i < $scope.items.length ; i++ ){
	    	$scope.selection.push($scope.items[i].bagid);
	    }
    	$scope.saveSelection();
    };

    $scope.selectAll = function(event){
	    var promise = BagService.search($scope.filter, 0, 0, $scope.sortfield, $scope.sortvalue);
	    $scope.loadingTracker.addPromise(promise);
	    promise.then(
	     	function(response) {
	     		$scope.alerts = response.data.alerts;
	     		$scope.selection = [];
	     		for( var i = 0 ; i < response.data.items.length ; i++ ){
	     			$scope.selection.push(response.data.items[i].bagid);
	     		}
	     		$scope.saveSelection();
	     		return false;
	     	}
	     	,function(response) {
	     		$scope.alerts = response.data.alerts;
	     		$scope.alerts.unshift({type: 'danger', msg: "Error code "+response.status});
	     		return false;
	     	}
	    );
    }

    $scope.saveSelection = function() {
    	var promise = FrontendService.updateSelection($scope.selection);
	    $scope.loadingTracker.addPromise(promise);
	    promise.then(
	     	function(response) {
	      		$scope.alerts = response.data.alerts;
	      		$scope.form_disabled = false;
	      	}
	      	,function(response) {
	      		$scope.alerts = response.data.alerts;
	      		$scope.alerts.unshift({type: 'danger', msg: "Error code "+response.status});
	      		$scope.form_disabled = false;
	      	}
	    );
    }

    $scope.loadSelection = function() {
    	var promise = FrontendService.getSelection();
	    $scope.loadingTracker.addPromise(promise);
	    promise.then(
	     	function(response) {
	      		$scope.alerts = response.data.alerts;
	      		$scope.selection = response.data.selection;
	      	}
	      	,function(response) {
	      		$scope.alerts = response.data.alerts;
	      		$scope.alerts.unshift({type: 'danger', msg: "Error code "+response.status});
	      	}
	    );
    }

    $scope.toggleFile = function(pid) {
    	var idx = $scope.selection.indexOf(pid);
    	if(idx == -1){
    		$scope.selection.push(pid);
    	}else{
    		$scope.selection.splice(idx,1);
    	}
    	$scope.saveSelection();
    };


    $scope.setPage = function (page) {
    	if(page == 1){
			$scope.from = 0;
		}else{
			$scope.from = (page-1)*$scope.limit;
		}

    	$scope.refreshResults();

    	$scope.currentPage = page;
    };


 $scope.refreshResults = function() {
	 $scope.searchBags($scope.filter, $scope.from, $scope.limit, $scope.sortfield, $scope.sortvalue);
 }

 $scope.searchBags = function(filter, from, limit, sortfield, sortvalue) {

     var promise = BagService.search(filter, from, limit, sortfield, sortvalue);
     $scope.loadingTracker.addPromise(promise);
     promise.then(
      	function(response) {
      		$scope.alerts = response.data.alerts;
      		$scope.items = response.data.items;
      		$scope.totalItems = response.data.hits;
      	}
      	,function(response) {
      		$scope.alerts = response.data.alerts;
      		$scope.alerts.unshift({type: 'danger', msg: "Error code "+response.status});
      	}
     );
 };

 $scope.toggleSort = function (sortfield, sortvalue) {
	 if($scope.sortfield == sortfield){
		 $scope.sortvalue = $scope.sortvalue == 1 ? -1 : 1;
	 }else{
		 $scope.sortvalue = 1;
	 }
	 $scope.sortfield = sortfield;
	 $scope.refreshResults();
 }


 $scope.addFilter = function (type, value) {
	 if($scope.filter){
		 if(type == 'status'){
			 // always an array
			 $scope.filter[type] = [value];
		 }else{
			 $scope.filter[type] = value;
		 }
		 $scope.refreshResults();
	 }
 }

 $scope.removeFilter = function (type, value) {
	 if($scope.filter){
		 if(type == 'status'){
			 // not setting a status filter means resetting it to all the allowed statuses
			 // (there are other statuses, like 'ingesting', bags with these should not be visible on the grid)
			 $scope.filter[type] = ['new','to_check','checked','to_ingest'];
		 }else{
			 delete $scope.filter[type];
		 }
		 $scope.refreshResults();
	 }
 }

 $scope.isNotDefaultFilter = function(type, value){
	 if(type == 'status'){
		 if(value.length > 1){
			 return false;
		 }
	 }
	 return true;
 }

 $scope.getFilterLabel = function(type, value){

	 if(type == 'status'){
		 if(value.length == 1){
			 var statValue = value[0];
			 for( var i = 0 ; i < $scope.initdata.statuses.length ; i++ ){
				if($scope.initdata.statuses[i].value == statValue){
					return $scope.initdata.statuses[i].label;
				}
			 }
		 }
	 }

	 if(type == 'assignee'){
		 return $scope.getMemberDisplayname(value);
	 }

	 return value;
 }


 $scope.setAttribute = function (bag, attribute, value) {
	 var promise = BagService.setAttribute(bag.bagid, attribute, value);
     $scope.loadingTracker.addPromise(promise);
     promise.then(
      	function(response) {
      		$scope.alerts = response.data.alerts;
      		bag[attribute] = value;
      	}
      	,function(response) {
      		$scope.alerts = response.data.alerts;
      		//$scope.alerts.unshift({type: 'danger', msg: "Error code "+response.status});
      	}
     );
 }

 $scope.setAttributeMass = function (attribute, value) {
	 var promise = BagService.setAttributeMass($scope.selection, attribute, value);
     $scope.loadingTracker.addPromise(promise);
     promise.then(
      	function(response) {
      		$scope.alerts = response.data.alerts;
      		$scope.refreshResults();
      	}
      	,function(response) {
      		$scope.alerts = response.data.alerts;
      		//$scope.alerts.unshift({type: 'danger', msg: "Error code "+response.status});
      	}
     );
 }

  $scope.tagModal = function (mode) {

	  var modalInstance = $modal.open({
        templateUrl: $('head base').attr('href')+'views/modals/define_tag.html',
        controller: TagModalCtrl,
        scope: $scope,
        resolve: {
			    mode: function(){
				   return mode;
				  }
		    }
	  });
  };

  $scope.createIngestJob = function () {
	  var modalInstance = $modal.open({
          templateUrl: $('head base').attr('href')+'views/modals/create_ingest_job.html',
          controller: CreateIngestJobModalCtrl,
          scope: $scope
	  });
  }


  $scope.getMemberDisplayname = function (username) {
	  for( var i = 0 ; i < $scope.initdata.members.length ; i++ ){
		  if($scope.initdata.members[i].username == username){
			  return $scope.initdata.members[i].displayname;
		  }
	  }
  }

  $scope.canSetAttribute = function (attribute) {
	  return $scope.initdata.restricted_ops.indexOf('set_'+attribute) == -1 || $scope.current_user.role == 'manager';
  }


});

var TagModalCtrl = function ($scope, $modalInstance, FrontendService, BagService, promiseTracker, mode) {

	$scope.modaldata = { tag: '' };

	$scope.operation = 'Ok';

	switch(mode){
		case 'add':
			$scope.operation = 'Add';
			break;

		case 'remove':
			$scope.operation = 'Remove';
			break;

		case 'filter':
			$scope.operation = 'Filter';
			break;
	}

    $scope.hitEnterTagEdit = function(evt){
    	if(angular.equals(evt.keyCode,13)){
    		$scope.applyAction();
    	}
    };

	$scope.applyAction = function () {

		$scope.form_disabled = true;

		var promise;

		switch(mode){
			case 'add':
				promise = BagService.setAttributeMass($scope.selection, 'tags', $scope.modaldata.tag);
				break;

			case 'remove':
				promise = BagService.unsetAttributeMass($scope.selection, 'tags', $scope.modaldata.tag);
				break;

			case 'filter':
				$scope.addFilter('tag', $scope.modaldata.tag);
				$modalInstance.close();
				$scope.refreshResults();
				break;
		}

		if(promise){
    	$scope.loadingTracker.addPromise(promise);
    	promise.then(
    		function(response) {
    			$scope.form_disabled = false;
    			$scope.alerts = response.data.alerts;
    			$modalInstance.close();
    			$scope.refreshResults();
    		}
    		,function(response) {
    			$scope.form_disabled = false;
    			$scope.alerts = response.data.alerts;
    			$modalInstance.close();
      	}
      );
		}

		return;

	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
};

var CreateIngestJobModalCtrl = function ($scope, $modalInstance, FrontendService, JobService, promiseTracker) {

	$scope.modaldata = { name: '', start_at: null, ingest_instance: null};

	$scope.baseurl = $('head base').attr('href');

	$scope.today = function() {
		$scope.modaldata.start_at = new Date();
	};

	// init
	$scope.today();

	$scope.ingestModalInit = function() {
		Object.keys($scope.initdata.ingest_instances).forEach(function (key) {
		    if($scope.initdata.ingest_instances[key].is_default == '1'){
		    	$scope.modaldata.ingest_instance = key;
		    }

		})
	}

	$scope.clear = function () {
		$scope.modaldata.start_at = null;
	};

	$scope.open = function($event) {
	    $event.preventDefault();
	    $event.stopPropagation();

	    $scope.opened = true;
	  };

	$scope.hitEnterCreate = function(evt){
		if(angular.equals(evt.keyCode,13)){
			$scope.createJob();
		}
	};

	$scope.createJob = function () {

		$scope.form_disabled = true;

		var promise = JobService.create($scope.selection, $scope.modaldata);

		$scope.loadingTracker.addPromise(promise);
		promise.then(
			function(response) {
				$scope.form_disabled = false;
				$scope.alerts = response.data.alerts;
				$modalInstance.close();
				window.location = $('head base').attr('href')+'jobs';
			}
			,function(response) {
				$scope.form_disabled = false;
				$scope.alerts = response.data.alerts;
				$modalInstance.close();
	        }
	    );
		return;

	};

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
};
