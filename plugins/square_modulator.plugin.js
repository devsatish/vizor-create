g_Plugins["square_modulator"] = function(core) {
	var self = this;
	
	this.input_slots = [ { name: 'time', dt: core.datatypes.FLOAT } ];
	this.output_slots = [ { name: 'value', dt: core.datatypes.FLOAT } ];
	
	this.reset = function(ui)
	{
		self.time = 0.0;
		self.result = 0.0;
	};
	
	this.update_input = function(index, data)
	{
		self.time = data;
	};	

	this.update_state = function(delta_t)
	{
		self.result = self.time % 1.0 < 0.5 ? 1.0 : -1.0;

	};
	
	this.update_output = function(index)
	{
		return self.result;
	};	
};