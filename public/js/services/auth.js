angular.module('App')
  .factory('Auth', function(LocalService, $http) {
    return {
      isAuthenticated: function() {
        return LocalService.get('user');
      },
      login: function(data) {
          LocalService.set('user', JSON.stringify(data));
      },
      logout: function() {
        // The backend doesn't care about logouts, delete the token and you're good to go.
        LocalService.unset('user');
        $http({
          method: 'POST',
          url: '/api/logout'
        });
      }
    }
  });