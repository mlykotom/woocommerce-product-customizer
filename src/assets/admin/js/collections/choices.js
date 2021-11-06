var PC = PC || {};
// PC.model = PC.model || {};


PC.choices = Backbone.Collection.extend({
	// url: function() { return ajaxurl + '?action='+PC.actionParameter+'&data=choices' },
	model: PC.choice,
	initialize: function( models, options ) {
		this.layer = options.layer;
		if ( ! this.layer ) return;
		this.layer_type = this.layer.get( 'type' );
	},
	nextOrder: function() {
		if ( ! this.length ) {
			return 1;
		}
		return this.last().get('order') + 1;
	},
	comparator: function( choice ) {
	   	return choice.get('order'); 
    },
    deactivateAll: function() {
    	this.each(function( choice ) {
    		choice.set('active', false);
    	});
    },
	resetChoice: function() {
		this.deactivateAll();
		if ( ! this.layer_type || 'simple' === this.layer_type ) {
			if ( ! this.layer.get( 'default_selection' ) || 'select_first' == this.layer.get( 'default_selection' ) ) {
				var default_selection = this.findWhere( { is_default: true } );
				if ( default_selection ) { 
					default_selection.set( 'active', true );
				} else {
					this.first().set( 'active', true );
				}
			}
		} else if ( 'multiple' === this.layer_type ) {
			var default_selection = this.where( { is_default: true } );
			_.each( default_selection, function( item ) {
				item.set( 'active', true );
			} );
		}
	},
	selectChoice: function ( choice_id, activate ) {
		var choice = this.get( choice_id );
		var is_active = choice.get('active');
		// Simple layers
		if ( 'simple' === this.layer_type || ! this.layer_type ) {
			// Already active, do nothing
			if ( is_active ) return;
			// Deactivate every other choice
			this.deactivateAll();
			// Set this choice to active
			choice.set( 'active', true );
		} else if ( 'multiple' === this.layer_type ) {
			// Multiple choice: toggle the current state
			if ( ! is_active && ( activate || 'undefined' == typeof activate ) ) {
				if ( wp.hooks.applyFilters( 'PC.choices.canSelectChoice', true, choice, this ) ) {
					choice.set( 'active', true );
				} else {
					console.log('Collections > choices > selectChoice - The choice (multiple) can not be selected');
					return;
				}
			} else {
				if ( ! activate ) choice.set( 'active', false );
			}


		}
		wp.hooks.doAction( 'PC.fe.choice.change', choice );
	},
	getType: function() {
		return this.layer_type;
	}
});

PC.content_list = Backbone.Collection.extend({
	model: PC.content, 
	initialize: function() {
	},
	resetConfig: function() {
		this.each( function( layer ) {
			var layer_model = PC.fe.layers.get( layer.get( 'layerId' ) );
			if ( ! layer_model.get( 'not_a_choice' ) ) {
				layer.get( 'choices' ).resetChoice();
			}
		}.bind( this ) );
	},
})

PC.choice_pictures = Backbone.Collection.extend({
	model: PC.choice_picture, 
}); 
