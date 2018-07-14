'use strict';

const
    abDate = require('ab-date'),
    js0 = require('js0'),

    spkForms = require('.')
;


export default class Field
{

    get elem() {
        js0.assert(`${this._fullName}_Field` in this._layout.$elems, 
                `Cannot find 'elem' in field layout.`);

        return this._layout.$elems[`${this._fullName}_Field`];
    }

    get fullName() {
        return this._fullName;
    }

    get value() {
        let type = this._info.type;

        /* Date Time */
        if (type === 'Checkbox') {
            return this.elem.checked ? true : false;
        } else if (type === 'Date') {
            let value = this.elem.value;

            return value === '' ? null : abDate.strToTime_Date(value);
        } else if (type === 'DateTime') {
            let value = this.elem.value;

            return value === '' ? null : abDate.strToTime_DateTime(value);
        } else if (type === 'Time') {
            let value = this.elem.value;

            return value === '' ? null : abDate.strToTime_Time(value);
        } else if (type === 'file') {
            let file = this.elem.files[0];
            return typeof file === 'undefined' ? null : file;
        } else if (type === 'text')
            return null;
        else if (type === 'radio') {
            console.log('Radio not implemented.');
            // let options = this._private.$elems.htmlElems('field');

            // for (let i = 0; i < options.length; i++) {
            //     if (options[i].checked)
            //         return options[i].getAttribute('value');
            // }

            // return '';
        } else if (type === 'Input' && this._info['input-type'] === 'checkbox')
            return this.elem.checked ? true : false;

        return this.elem.value;
    }
    set value(value) {
        if (value === null)
            value = '';

        if (this._info.type === 'Checkbox') {
            this.elem.checked = value ? true : false;
            let event = document.createEvent("HTMLEvents");
            event.initEvent("change", true, true);
            this.elem.dispatchEvent(event);
        } else if (this._info.type === 'Date' || this._info.type === 'DateTime' ||
                this._info.type === 'time') {
            let m = value === '' ? '' : moment(value * 1000)
                    .utcOffset(abDate.utcOffset);
            $(this.elem).data('DateTimePicker').date(m);
        } else if (this._info.type === 'file') {
            /* Do nothing. */
        } else if (this._info.type === 'radio') {
            let options = this._private.$elems.htmlElems('field');

            for (let i = 0; i < options.length; i++) {
                if (options[i].getAttribute('value') === value) {
                    options[i].checked = true;
                    return;
                }
            }
        } else if (this._info.type === 'Input') {
            if (this._info['input-type'] === 'checkbox') {
                this.elem.checked = value === 'true';
                let event = document.createEvent("HTMLEvents");
                event.initEvent("change", true, true);
                this.elem.dispatchEvent(event);
            } else
                this.elem.value = value;
        } else if (this._info.type === 'Select') {
            let elem = this.elem;

            let selected = false;
            let options = this.elem.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value === value + '') {
                    options[i].selected = true;

                    let event = document.createEvent("HTMLEvents");
                    event.initEvent("change", true, true);
                    this.elem.dispatchEvent(event);

                    selected = true;
                    break;
                }
            }

            if (!selected)
                console.warn('Cannot find option `' + value + '`.');
        } else if (this._info.type === 'text')
            this.elem.innerHTML = value;
        else
            this.elem.value = value;

        // if (this._private.valueFieldName !== null)
        //     this._private.mForm.$fields[this._private.valueFieldName] = this.value;
        // }
    }

    constructor(layout, fieldInfo)
    {
        this._layout = layout;
        this._info = fieldInfo;

        this._fullName = `spkForms_${fieldInfo.form}_${fieldInfo.name}`;

        let fields = {};
        fields[`${this._fullName}_Label`] = 'label' in this._info ? this._info.label : '';        

        this.init();

        this._layout.$fields = fields;
    }

    clearValidator()
    {
        this._layout.$fields[`${this._fullName}_Validator`] = {
            errors: [],
            divClass: '',
        }
    }

    field(fieldName, ...args)
    {
        if (args.length === 0)
            return this._layout.$fields[`${this.fullName}_${fieldName}`];
        else
            this._layout.$fields[`${this.fullName}_${fieldName}`] = args[0];
    }

    init()
    {
        let onChange = (evt) => {
            this.clearValidator();
        };

        if (this._info.type === 'Date' || this._info.type === 'DateTime' ||
                this._info.type === 'Time') {
            let format;
            if (this._info.type === 'Date')
                format = 'L';
            else if (this._info.type === 'DateTime')
                format = 'L LT';
            else if (this._info.type === 'Time')
                format = 'LT';

            /* Initialize `date` field. */
            $(this.elem)
                .datetimepicker( {
                    format: format,
                    showTodayButton: this._info.type !== 'Time',
                    useCurrent: false,
                    locale: spkForms.lang,
                })
                .on('dp.show', (evt) => {
                    if($(this.elem).data("DateTimePicker").date() === null)
                        $(this.elem).data("DateTimePicker").date(moment());
                })
                .on('dp.hide', (evt) => {
                    this.elem.setAttribute('value', this.elem.value);
                    this.clearValidator();
                    this.elem.blur();
                });
        } else if (this._info.type === 'file') {
            this.fields.accept = '';
            if (this.attrExists('accept'))
                this.fields.accept = this.getAttr('accept');
        } else if (this._info.type === 'radio') {
            this.$elems.each('field', function(elem) {
                elem.addEventListener('change', on_change);
            });
        } else if (this._info.type === 'select' || this._info.type === 'file') {
            this.elem.addEventListener('change', on_change);
        } else if (this._info.type === 'Input' || this._info.type === 'TextArea') {
            this.elem.addEventListener('change', onChange);
            this.elem.addEventListener('keyup', onChange);

            // this.elem.setAttribute('value', '');
        }
    }

    setValidator(validator)
    {
        this._layout.$fields[`${this._fullName}_Validator`] = {
            errors: 'errors' in validator ? validator.errors : [],
            divClass: validator.state === 'error' ?
                    'has-error' : '',
        }
    }

}