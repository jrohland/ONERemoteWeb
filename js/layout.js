(function() {
	var defaultRemoteNames = ['tv','ac'];
	var remotes = {};
	var currentRemote = null;

	var nav = function() {

		var initalizeRemoteMenu = function() {
			$('.nav.remote-menu .dropdown-menu').children().remove();
			for (var remoteId in remotes) {
				$('.nav.remote-menu .dropdown-menu').append('<li data-remote-name="' + remoteId + '"><a href="#">' + remotes[remoteId]['name'] + '</a></li>');
			}

			$('.nav.remote-menu .dropdown-menu li').click(function() {
				var selectedItem = $(this).children('a').html();
				$('.nav.remote-menu .dropdown-toggle').html(selectedItem + ' <b class="caret"></b>');
				$('.nav.remote-menu .dropdown-menu li.active').removeClass('active');
				$(this).addClass('active');
				changeRemote($(this).data('remoteName'));
			});
		};

		(function() {
			initalizeRemoteMenu();

			if ($('.nav.remote-menu .dropdown-menu li:first-child').length == 1) {
				$('.nav.remote-menu .dropdown-menu li:first-child').trigger('click');
			}
		})();
		
	};

	var actionBtn = function() {

		var initalizeActionMenu = function() {
			$('.action-menu .dropdown-menu li').click(function() {
				var action = $(this).data('action');
				if (action === 'save') {
					saveRemotes();
					bootstrapAlert.success('Saved');
				} else if (action === 'delete-remote') {
					$('#delete-modal .modal-body').html('Confirm if you would like to delete remote: "<strong>' + currentRemote + '</strong>"');
					$('#delete-modal').modal();
				} else if (action === 'default-remotes') {
					$('#install-default-modal').modal();
				} else if (action === 'edit-remote') {
					var remote = remotes[currentRemote];
					$('#edit-remote-modal #remote-name').val(currentRemote);
					$('#edit-remote-modal #remote-buttons').val(JSON.stringify(remote['buttons']));
					$('#edit-remote-modal').modal();
				}
			});

			$('#delete-modal .btn.delete').click(function(evt) {
				deleteRemote(currentRemote);
				$('#delete-modal').modal('hide');

				evt.stopPropagation();
				evt.preventDefault();
			});

			$('#install-default-modal .btn.install').click(function(evt) {
				installDefaultRemotes();
				$('#install-default-modal').modal('hide');

				evt.stopPropagation();
				evt.preventDefault();
			});

			$('#edit-remote-modal .btn.save').click(function(evt) {
				var newRemoteName = $('#edit-remote-modal #remote-name').val();
				var newButtons = JSON.parse($('#edit-remote-modal #remote-buttons').val());
				if (currentRemote !== newRemoteName) {
					delete remotes[currentRemote];
				}
				remotes[newRemoteName] = {};
				remotes[newRemoteName]['buttons'] = newButtons;
				currentRemote = newRemoteName;

				saveRemotes();
				refreshRemotes();

				changeRemote(newRemoteName);

				$('#edit-remote-modal').modal('hide');

				evt.stopPropagation();
				evt.preventDefault();
			});

		};

		(function() {
			initalizeActionMenu();
		})();

	};

	var changeRemote = function(remoteName) {
		var remote = remotes[remoteName];
		currentRemote = remoteName;

		$('.remote .container').children().remove();

		for (var i = 0; i < remote['buttons'].length; i++) {
			var button = remote['buttons'][i];
			var buttonHtml = '<button type="button" class="btn btn-default btn-lg" style="position:absolute;" data-button-code="' + button['code'] + '">';

		    if ('icon' in button) {
		    	buttonHtml += '<span class="glyphicon glyphicon-' + button['icon'] + '"></span>';
		    }

		    if ('text' in button) {
		    	buttonHtml += ' ' + button['text'];
		    }

		    buttonHtml += '</button>';
		    var buttonEle = $(buttonHtml).click(function() {
					window.location = 'otrta://code?id=' + $(this).data('buttonCode');
				});

		    if ('x' in button) {
		    	buttonEle.css('left', button['x']);
		    }

		    if ('y' in button) {
		    	buttonEle.css('top', button['y']);
		    }

		    if ('width' in button) {
		    	buttonEle.css('width', button['width']);
		    }

		    if ('height' in button) {
		    	buttonEle.css('height', button['height']);
		    }

		    if ('align' in button) {
		    	buttonEle.addClass('text-' + button['align']);
		    } else {
		    	buttonEle.addClass('text-center');
		    }

		    buttonEle.click(function() {
				window.location = 'otrta://code?id=' + $(this).data('buttonCode');
			});

		    $('.remote .container').append(buttonEle);
		}
	};

	var deleteRemote = function(remoteName) {
		delete remotes[remoteName];
		bootstrapAlert.success("Deleted '" + remoteName + "'");
		saveRemotes();
		refreshRemotes();
	};

	var installDefaultRemotes = function() {
		remotes = {};
		for (i = 0; i < defaultRemoteNames.length; i++) {
			$.ajax({
			  url: "remotes/" + defaultRemoteNames[i] + ".json",
			  dataType: 'json',
			  async: false,
			  success: function(data) {
			  	remotes[data['id']] = data;
			  }
			});
		};
		saveRemotes();
		refreshRemotes();
		bootstrapAlert.success("Installed default remotes");
	};

	var refreshRemotes = function() {
		remotes = JSON.parse(localStorage.getItem('remotes'));
		nav();
	};
	
	var saveRemotes = function() {
		localStorage.setItem('remotes', JSON.stringify(remotes));
	};

	$(document).ready(function() {
		actionBtn();
		refreshRemotes();
	});
})();


var bootstrapAlert = function() {}
bootstrapAlert.warning = function(message) {
	$('#alert-placeholder').html('<div class="alert alert-warning"><a class="close" data-dismiss="alert">x</a><span>'+message+'</span></div>')
};
bootstrapAlert.success = function(message) {
	$('#alert-placeholder').html('<div class="alert alert-success"><a class="close" data-dismiss="alert">x</a><span>'+message+'</span></div>')
};
bootstrapAlert.danger = function(message) {
	$('#alert-placeholder').html('<div class="alert alert-danger"><a class="close" data-dismiss="alert">x</a><span>'+message+'</span></div>')
};