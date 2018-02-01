  /*
  * Calc.js
  * Author: Morocon Dom (moinuddin98@gmail.com)
  * Version: 1.0.0

  * Simple jquery plugin for mortgage calculator
  */


(function($, window, document, undefined) {

    $.extend($.fn, {
        calC: function(opts) {

            opts = $.extend({
                calCMethod: calculateAmortization
            }, $.fn.calC.opts, opts);

            return this.each(function() {
              var elm = $(this);
                if (!elm.find(".form").length) {
                    elm.append('<div class="form"></div>');
                }
                var amount = get_field(elm, opts, "amount");
                var rate = get_field(elm, opts, "rate");
                var term = get_field(elm, opts, "term");

                var output_elm;
                if (opts.response_output_div === ".results") {

                    if (elm.find(".results")
                        .length === 0) {
                        elm.append('<div class="results"></div>');
                    }
                      output_elm = elm.find(".results");

                } else {output_elm = $(opts.response_output_div);}

            var calC_method;
                switch (opts.mode) {

                    case "amortization":
                        calC_method = calculateAmortization;
                        break;
                        // more methods
                }


              calC_method(elm, opts, output_elm);

            if (opts.operation == "button") {
                    if (elm.find("button")
                        .length === 0 && elm.find("input[type=submit]")
                        .length === 0 && elm.find("input[type=image]")
                        .length === 0) {
                        elm.find(".form")
                            .append('<button class="calC-calculate">' + opts.button_label + '</button>');
                    }


          elm.find("button, input[type=submit], input[type=image]")
                          .each(function() {
                            $(this)
                                .click(function(event) {
                                    event.preventDefault();
                                    calC_method(elm, opts, output_elm);
                                });
                        });

                } else {

                  //ops methods
                elm.find("input, select")
                        .each(function() {
                            $(this)
                                .bind("keyup change", function() {
                                    calC_method(elm, opts, output_elm);
                                });
                        });

                }

          //ops mehtod button
                elm.find("form")
                    .each(function() {
                        $(this)
                            .submit(function(event) {
                                event.preventDefault();
                                calC_method(elm, opts, output_elm);
                            });
                    });

            });
        }
    });

    //m
    //defaults
    $.fn.calC.opts = {
        mode: "amortization",
        operation: "keyup",
        default_values: {
            amount: "$100",
            rate: "2%",
            term: "12m"
        },
        field_titles: {
            amount: "Loan Amount",
            rate: "Rate (APR)",
            term: "Term"
        },
        button_label: "Calculate",
        field_comments: {
            amount: "",
            rate: "",
            rate_compare: "",
            term: "use these format [y : year, m: month]: 12m, 36m, 3y, 7y"
        },
        response_output_div: ".results",
        response_basic: '<p><strong>Monthly Payment:</strong><br />$%payment_amount%</p>' +
            '<p><strong>Number of Payments:</strong><br />%num_payments%</p>' +
            '<p><strong>Total Payments:</strong><br />$%total_payments%</p>' +
            '<p><strong>Total Interest:</strong><br />$%total_interest%</p>',
        response_compare: '<p class="total-savings">Save $%savings% in interest!</p>',
        error_text: '<p class="error">Please fill in all fields.</p>',
        callback: function(elm, data) {}
    };
//currency format $
    function formatNumber(num) {
        return num.toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    var get_field = function(elm, opts, name) {


        var field;
        if (elm.find(".calC-" + name)
            .length) {
            field = elm.find(".calC-" + name);
        } else if (elm.find("." + name)
            .length) {
            field = elm.find("." + name);
        } else if (elm.find("input[name~=" + name + "]")
            .length) {
            elm.find("input[name~=" + name + "]");
        } else {
            field = "";
        }

        if (typeof(field) !== "string") {
            return field.val();
        }
        if (name == "term_compare") {
            return false;
        }

    //m
    //craete if fields not exists
        elm.find(".form")
            .append(
                '<div class="calC-field-' + name + '">' +
                '<p><label>' + opts.field_titles[name] + ':</label>' +
                '<input type="text" class="' + name + '" value="' + opts.default_values[name] + '" />' +
                (opts.field_comments[name].length > 0 ? "<small>" + opts.field_comments[name] + "</small>" : '') + '</p>' +
                '</div>');
        return elm.find("." + name)
            .val();

    };


//main
    var calculateAmortization = function(elm, opts, output_elm) {

        var loan_info = $.loanInfo({
            amount: get_field(elm, opts, "amount"),
            rate: get_field(elm, opts, "rate"),
            term: get_field(elm, opts, "term")
        });


        if (loan_info !== 0) {

    //create table
            var output_content = '<table class="calC-amortization">' +
                '<thead><tr>' +
                '<th class="calC-payment-number">#</th>' +
                '<th class="calC-payment-amount">Payment Amt.</th>' +
                '<th class="calC-total-interest">Total Interest</th>' +
                '<th class="calC-total-payments">Total Payments</th>' +
                '<th class="calC-balance">Balance</th>' +
                '</tr></thead><tbody>',
                interest_per_payment = loan_info.payment_amount - (loan_info.original_amount / loan_info.num_payments),
                amount_from_balance = loan_info.payment_amount - interest_per_payment,
                counter_interest = 0,
                counter_payment = 0,
                counter_balance = parseInt(loan_info.original_amount, 10);
            for (var i = 0; i < loan_info.num_payments; i++) {

                counter_interest = counter_interest + interest_per_payment;
                counter_payment = counter_payment + loan_info.payment_amount;
                counter_balance = counter_balance - amount_from_balance;

            var cell_tag = "td";
                if (i == (loan_info.num_payments - 1)) {
                    cell_tag = "th";
                }
                output_content = output_content +
                    '<tr>' +
                    '<' + cell_tag + ' class="calC-payment-number">' + (i + 1) + '</' + cell_tag + '>' +
                    '<' + cell_tag + ' class="calC-payment-amount">$' + formatNumber(loan_info.payment_amount_formatted) + '</' + cell_tag + '>' +
                    '<' + cell_tag + ' class="calC-total-interest">$' + formatNumber(counter_interest.toFixed(2)) + '</' + cell_tag + '>' +
                    '<' + cell_tag + ' class="calC-total-payments">$' + formatNumber(counter_payment.toFixed(2)) + '</' + cell_tag + '>' +
                    '<' + cell_tag + ' class="calC-balance">$' + formatNumber(counter_balance.toFixed(2)) + '</' + cell_tag + '>' +
                    '</tr>';
            }

            output_content = output_content +
                '</tbody></table>';

            output_elm.html(output_content);
        } else {output_elm.html(opts.error_text);}

        //  callback loan infp
        opts.callback(elm, loan_info);
    };


    //if error log
    var log = function(message) {
        if (window.console)console.log(message);
    };

//m
//info main ingredients details
    $.loanInfo = function(input) {

        var amount = (typeof(input.amount) !== "undefined" ? input.amount : 0)
            .toString()
            .replace(/[^\d.]/ig, ''),
            rate = (typeof(input.rate) !== "undefined" ? input.rate : 0)
            .toString()
            .replace(/[^\d.]/ig, ''),
            term = (typeof(input.term) !== "undefined" ? input.term : 0);

        if (term.match("y")) {
            term = parseInt(term.replace(/[^\d.]/ig, ''), 10) * 12;
        } else {
            term = parseInt(term.replace(/[^\d.]/ig, ''), 10);
        }

        var monthly_interest = rate / 100 / 12;

        var x = Math.pow(1 + monthly_interest, term),
            monthly = (amount * x * monthly_interest) / (x - 1);

        if (amount * rate * term > 0) {
            return {
                original_amount: amount,
                payment_amount: monthly,
                payment_amount_formatted: monthly.toFixed(2),
                num_payments: term,
                total_payments: (monthly * term),
                total_payments_formatted: (monthly * term)
                    .toFixed(2),
                total_interest: ((monthly * term) - amount),
                total_interest_formatted: ((monthly * term) - amount)
                    .toFixed(2)
            };
        } else {
            return 0;
        }
    };



//payment amount
    $.loanAmount = function(input) {

        var payment = (typeof(input.payment) !== "undefined" ? input.payment : 0)
            .toString()
            .replace(/[^\d.]/ig, ''),
            rate = (typeof(input.rate) !== "undefined" ? input.rate : 0)
            .toString()
            .replace(/[^\d.]/ig, ''),
            term = (typeof(input.term) !== "undefined" ? input.term : 0);

        if (term.match("y")) {
            term = parseInt(term.replace(/[^\d.]/ig, ''), 10) * 12;
        } else {
            term = parseInt(term.replace(/[^\d.]/ig, ''), 10);
        }

        var monthly_interest = rate / 100 / 12,
            annual_interest = rate / 100;

//magic ingredient
        var x = payment * (1 - Math.pow(1 + monthly_interest, -1 * term)) * (12 / (annual_interest));


        if (x > 0) {
            return {
                principal_amount: x,
                principal_amount_formatted: (x * 1)
                    .toFixed(2),
                payment_amount: payment,
                payment_amount_formatted: (payment * 1)
                    .toFixed(2),
                num_payments: term,
                total_payments: (payment * term),
                total_payments_formatted: (payment * term)
                    .toFixed(2),
                total_interest: ((payment * term) - x),
                total_interest_formatted: ((payment * term) - x)
                    .toFixed(2)
            };

        } else { return 0;}};
      })(jQuery, window, document);
