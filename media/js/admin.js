$(document).ready(function() {
   $('.dropdown-submenu a').on("click", function(e){
       $(this).next('ul').toggle();
       e.stopPropagation();
       e.preventDefault();
   });

   /* Set up mailbox checkboxes */
   $('#mailcheckboxtoggler').click(function() {
      var root = $($('#datatable').data('datatable').rows( { filter : 'applied'} ).nodes());
      if (root.find('input.mailcheckbox:checked').length == 0) {
         root.find('input.mailcheckbox').prop('checked', true);
      }
      else {
         root.find('input.mailcheckbox').prop('checked', false);
      }
      update_sendmail_count();
   });

   $('input.mailcheckbox').change(function() {
      update_sendmail_count();
   });

   $('#sendmailbutton').click(function() {
      if (!$('#datatable').data('datatable')) return;

      var nodes = $($('#datatable').data('datatable').rows().nodes()).find('input.mailcheckbox:checked');
      window.location.href='sendmail/?idlist='+nodes.map(function() {
         return this.id.substring(3); // Remove em_ at the beginning
      }).get().join();
   });

   /* Set up assignment checkboxes */
   $('input.assigncheckbox').change(function() {
      update_assign_count();
   });

   $('a.multiassign').click(function(e) {
       var assignid = $(this).data('assignid');
       var what = $(this).parent().parent().data('what');
       var title = $(this).parent().parent().data('title');

       var nodes = $($('#datatable').data('datatable').rows().nodes()).find('input.assigncheckbox:checked');
       if (confirm('Are you sure you want to assign ' + title + ' to ' + nodes.length + ' items?')) {
	   $('#assignform_idlist').val(nodes.map(function() {
               return this.id.substring(4); // Remove ass_ at the beginning
	   }).get().join());
	   $('#assignform_what').val(what);
	   $('#assignform_assignid').val(assignid);
	   $('#assignform').submit();
       }
   });

   update_sendmail_count();
   update_assign_count();
});

function update_sendmail_count() {
   if ($('#datatable').data('datatable')) {
      n = $($('#datatable').data('datatable').rows().nodes()).find('input.mailcheckbox:checked').length;
   }
   else {
      n = 0;
   }
   $('#sendmailbutton').prop('disabled', n == 0).each(function() {
      /* Wrap in a function so it doesn't break if there exists no template */
      $(this).text($('#sendmailbutton').data('template').replace('{}', n));
   });
}

function update_assign_count() {
   if ($('#datatable').data('datatable')) {
      n = $($('#datatable').data('datatable').rows().nodes()).find('input.assigncheckbox:checked').length;
   }
   else {
      n = 0;
   }
   $('#assignbutton').prop('disabled', n == 0).each(function() {
      /* Wrap in a function so it doesn't break if there exists no template */
      $(this).html($('#assignbutton').data('template').replace('{}', n) + ' <span class="caret"></span>');
   });
}
