
function PresetManager(base_url)
{
	var that = this

	EventEmitter.call(this)

	this._base_url = base_url
	this._presets = {}

	this.refresh()

	E2.models.user.on('change', this.refresh.bind(this))
}

PresetManager.prototype = Object.create(EventEmitter.prototype)

PresetManager.prototype.loadPlugins = function(cb) {
	var that = this

	$.ajax({
		url: '/plugins/plugins.json',
		cache: true
	})
	.done(function(data) {
		Object.keys(data).forEach(function(title) {
			that.add('PLUGINS', title, 'plugin/'+data[title])
		})
		cb()
	})
}

PresetManager.prototype.loadPresets = function(cb) {
	var that = this

	$.ajax({
		url: this._base_url + '/presets.json',
		cache: true
	})
	.done(function(data) {
		Object.keys(data).forEach(function(catName) {
			Object.keys(data[catName]).forEach(function(title) {
				that.add(catName, title, that._base_url+'/'+data[catName][title]+'.json')
			})
		})

		cb()
	})
	.fail(function() {
		msg('PresetsMgr: No presets found.')
	})
}

PresetManager.prototype.loadUserPresets = function(cb) {
	var that = this
	var username = E2.models.user.get('username')
	if (!username)
		return cb()

	$.get('/'+username+'/presets', function(presets) {
		var cat = 'MY PRESETS'
		that._presets[cat] = {}

		presets.forEach(function(preset) {
			that.add(cat, preset.name, preset.url)
		})

		cb()
	})
}

PresetManager.prototype.refresh = function() {
	var that = this

	this.loadUserPresets(function() {
		that.loadPresets(function() {
			that.loadPlugins(function() {
				that.render()
			})
		})
	})
}

PresetManager.prototype.render = function()
{
	var that = this

	E2.dom.presets_list.empty()

	new CollapsibleSelectControl()
	.data(this._presets)
	.template(E2.views.presets.presets)
	.render(E2.dom.presets_list)
	.onOpen(function(path) {

		if (path.indexOf('plugin/') === 0) {
			return that.openPlugin(path);
		}

		var url = path

		msg('Loading preset from: ' + url);

		$.get(url)
		.done(function(data)
		{
			E2.app.fillCopyBuffer(data.root.nodes, data.root.conns, 0, 0);
			E2.app.onPaste({ target: { id: 'notpersist' }});
		})
		.fail(function(_j, _textStatus, _errorThrown)
		{
  			msg('ERROR: Failed to load the selected preset.');
		})
	})
}

PresetManager.prototype.add = function(category, title, path)
{
	if (!this._presets[category])
		this._presets[category] = {};

	this._presets[category][title] = path;
}

PresetManager.prototype.openPlugin = function(path, cb)
{
	var id = path.substring('plugin/'.length);

	var data = { abs_t: 0, active_graph: 0, graph_uid: 1, root:
		{ node_uid: 1, uid: 0, parent_uid: -1, open: true, nodes:
			[{ plugin: id, x: 50, y: 50, uid: 0}], conns: [] }};

	E2.app.fillCopyBuffer(data.root.nodes, data.root.conns, 0, 0);
	E2.app.onPaste();
}

