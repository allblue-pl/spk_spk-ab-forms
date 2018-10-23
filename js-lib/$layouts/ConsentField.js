'use strict';

const
    spocky = require('spocky')
;

export default class ConsentField extends spocky.Layout {

    static get Content() {
        return [["div",{"class":["form-check my-4 ${{fullFieldName}}.divClass {{fullFieldName}}_Validator.divClass"],"_data-spk-field":["{{formName}}:{{fieldInfo}}"]},["input",{"_elem":["{{fullFieldName}}_Field"],"type":["checkbox"],"id":["{{fullFieldName}}"],"name":["{{fieldName}}"],"class":["form-check-input ${{fullFieldName}}_Validator.fieldClass"],"placeholder":["{{fieldPlaceholder}}"]}],["p",{"_repeat":["{{fullFieldName}}_Validator.errors:errorMessage"],"class":["invalid-feedback"]},"$errorMessage"],["label",{"_show":["{{fullFieldName}}_Label"],"for":["{{fullFieldName}}"],"class":["form-check-label {{labelClass}}"]},"{{fieldLabel}}"]]];
    }


    constructor()
    {
        super(ConsentField.Content);
    }

}
