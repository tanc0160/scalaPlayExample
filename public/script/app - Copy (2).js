var app = angular.module('myapp', ['datatables', 'mgo-angular-wizard', 'satellizer'])
.config(function($authProvider) {
	$authProvider.oauth2({
      name: 'connect2id',
      clientId: 'amyucyj5k3i5y',
	  url: 'http://127.0.0.1:8080/c2id/token',
      redirectUri: "https://127.0.0.1:8081/",
	  responseType: 'id_token+token',
	  requiredUrlParams: ['scope'],
	  scope: ['openid'],
	  type: '2.0',
	  scopeDelimiter: '+',
      authorizationEndpoint: 'http://127.0.0.1:8080/c2id-login-page-js',
    });
});
app.controller('AngularWayCtrl', AngularWayCtrl);
app.directive('dropzone', function() {
		return {
			restrict: 'C',
			scope: {
				'abc' : '&'
			},
			link: function(scope, element, attrs) {
				parentFunc = scope.abc();
				var config = {
					url: 'http://localhost:8080/upload',
					maxFilesize: 100,
					paramName: "uploadfile",
					maxThumbnailFilesize: 10,
					parallelUploads: 1,
					autoProcessQueue: false
				};

				var eventHandlers = {
					'addedfile': function(file) {
						scope.file = file;
						parentFunc("file", scope.file);
						if (this.files[1]!=null) {
							this.removeFile(this.files[0]);
						}
						scope.$apply(function() {
							scope.fileAdded = true;
						});
					},

					'success': function (file, response) {
					}

				};

				dropzone = new Dropzone(element[0], config);

				angular.forEach(eventHandlers, function(handler, event) {
					dropzone.on(event, handler);
				});

				scope.processDropzone = function() {
					dropzone.processQueue();
				};
				parentFunc("resetDropzone", scope.processDropzone);
				scope.resetDropzone = function() {
					//alert("hi");
					dropzone.removeAllFiles();
				};
				parentFunc("resetDropzone", scope.resetDropzone);
			}
		}
});

function AngularWayCtrl($scope, $auth) {
    $scope.persons = [{'id': 1, 'firstName': 'cp', 'lastName': 'tan'}, {'id': 2, 'firstName': 'ht', 'lastName': 'fu'}];
	
	$scope.finishedWizard = function()
	{
		alert("hi");
	};
	
	$scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function(response){
		 $scope.message = $auth.getToken();
	  }, function(err){
		  $scope.message = err;
	  });
    };
	
	$scope.testDrop = function()
	{
		alert("hi" + $scope.file.name);
		$scope.resetDropzone();
	};
	
	$scope.setParentScope = function()
	{
		return function(attrItem, attrValue)
		{
			$scope[attrItem] = attrValue;
		}
	};
	
}