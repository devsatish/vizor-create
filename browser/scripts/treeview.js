function TreeNode(tree, parent_node, title, graph_node)
{
	this.tree = tree;
	this.parent_node = parent_node;
	this.title = title;
	this.graph_node = graph_node;
	this.children = [];
	this.dom = this.label = null;
	this.closed = false;
	this.selected = false;
}

TreeNode.prototype.add_child = function(title)
{
	var tn = new TreeNode(this.tree, this, title, null);
	
	this.children.push(tn);
	this.rebuild_dom();
	return tn;
};

TreeNode.prototype.remove = function()
{
	if(!this.parent_node)
		return;
	
	var pc = this.parent_node.children;
	
	this.dom.remove();
	pc.splice(pc.indexOf(this), 1);
};

TreeNode.prototype.remove_children = function(title)
{
	this.children = [];
};

TreeNode.prototype.activate = function()
{
	this.tree.select(this);
};

TreeNode.prototype.set_title = function(title)
{
	this.title = title;
	this.rebuild_dom();
};

TreeNode.prototype.rebuild_dom = function()
{
	var dom = null;
		
	if(this.children.length > 0 || this.parent_node === null)
	{
		dom = make('ul');
		dom.addClass('tree-sub');
		
		var handle = $('<div class="tree-handle glyphicon glyphicon-chevron-' + (this.closed ? 'right' : 'down') + '"></div>');
		
		handle[0].addEventListener('mousedown', function(t_node) { return function()
		{
			t_node.closed = !t_node.closed;
			t_node.rebuild_dom();
		}}(this));
		
		dom.append(handle);
		
		this.label = $('<span class="tree-name">' + this.title + '</span>');
		
		dom.append(this.label);
		
		if(!this.closed)
		{
			var children = this.children;
			var process_child = function(child, dirs)
			{
				if((dirs && child.children.length > 0) || (!dirs && child.children.length < 1))
				{
					child.rebuild_dom();
					dom.append(child.dom);
				}

			};
			
			for(var i = 0, len = children.length; i < len; i++)
				process_child(children[i], true);
				
			for(var i = 0, len = children.length; i < len; i++)
				process_child(children[i], false);
		}
	}
	else
	{
		dom = make('span');
		dom.addClass('tree-item');
		dom.text(this.title);
		this.label = dom;
	}
	
	this.label[0].addEventListener('mousedown', function(t_node) { return function()
	{
		t_node.tree.select(t_node);
	}}(this));
	
	if(this.selected)
		this.label.addClass('tree-selected');
	
	if(this.dom)
		this.dom.replaceWith(dom);
	
	this.dom = dom;
};

function TreeView(parent, on_activate, on_rearrange)
{
	this.parent = parent;
	this.on_activate = on_activate;
	this.on_rearrange = on_rearrange;
	this.selected_node = null;
	this.root = new TreeNode(this, null, 'Root', null);

	this.root.rebuild_dom();
	this.parent.append(this.root.dom);
}

TreeView.prototype.reset = function()
{
	this.root.remove_children();
	this.root.closed = false;
	this.root.selected = false;
	this.root.rebuild_dom();
};

TreeView.prototype.select = function(t_node)
{
	if(t_node === this.selected_node)
		return;
	
	if(this.selected_node)
	{
		this.selected_node.label.removeClass('tree-selected');
		this.selected_node.selected = false;
	}
		
	this.on_activate(t_node.parent_node ? t_node.graph : this.root.graph);

	this.selected_node = t_node;
	t_node.selected = true;
	t_node.label.addClass('tree-selected');
};