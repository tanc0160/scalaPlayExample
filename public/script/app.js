var app = angular.module('myapp', ['datatables', 'mgo-angular-wizard', 'satellizer'])
.config(function($authProvider) {
	$authProvider.oauth2({
      name: 'connect2id',
      clientId: 'pqgxpr4xpjyhm',
	  url: 'http://127.0.0.1:8080/c2id/token',
      redirectUri: "http://127.0.0.1:8081/",
	  responseType: 'code',
	  requiredUrlParams: ['scope'],
	  scope: ['openid'],
	  type: '2.0',
	  scopeDelimiter: '+',
      authorizationEndpoint: 'http://127.0.0.1:8080/c2id-login-page-js',
    });
});
app.controller('AngularWayCtrl', AngularWayCtrl);
app.directive('dropzone', function($http) {
		return {
			restrict: 'C',
			scope: {
				'abc' : '&'
			},
			link: function(scope, element, attrs) {
				parentFunc = scope.abc();
				var config = {
					url: 'upload.php',
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
					//dropzone.processQueue();
					
					var fd = new FormData();
					fd.append('file', scope.file);
					fd.append("docname", "Hello World");
					fd.append("templateName", "Template A");
					$http.post('/upload', fd, {
						transformRequest: angular.identity,
						headers: {'Content-Type': undefined}
					})
					.success(function(response){
					    alert(JSON.stringify(response));
					    dropzone.removeAllFiles();
					})
					.error(function(){
					});
				};
				parentFunc("processDropzone", scope.processDropzone);
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
		$scope.processDropzone();
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
		//alert("hi");
		$scope.processDropzone();
	};
	
	$scope.setParentScope = function()
	{
		return function(attrItem, attrValue)
		{
			$scope[attrItem] = attrValue;
		}
	};
	
}