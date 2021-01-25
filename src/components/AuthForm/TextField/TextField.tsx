import React from 'react';
import { Field, FieldMetaState, FieldProps, FieldRenderProps } from 'react-final-form';
import { TextField as VegaTextField } from '@gpn-prototypes/vega-ui';

type VegaTextFieldProps = Omit<
  React.ComponentProps<typeof VegaTextField>,
  'defaultValue' | 'value' | 'state'
>;
type FinalFormFieldProps = Pick<FieldProps<string, FieldRenderProps<string>>, 'validate' | 'value'>;

interface TextFieldProps extends VegaTextFieldProps, FinalFormFieldProps {
  name: string;
  validateOnTouched?: boolean;
}

type TextFieldState = React.ComponentProps<typeof VegaTextField>['state'];

type TextFieldMeta = FieldMetaState<string>;

export const TextField: React.FC<TextFieldProps> = (props) => {
  const { validateOnTouched = false, ...restProps } = props;

  const getFieldState = (meta: TextFieldMeta): TextFieldState => {
    const { error, touched, submitFailed } = meta;
    if (error) {
      if ((validateOnTouched && touched) || submitFailed) {
        return 'alert';
      }
    }
    return undefined;
  };

  return (
    <Field
      {...restProps}
      render={({ input, meta, ...rest }): React.ReactNode => (
        <VegaTextField
          {...rest}
          value={input.value}
          name={input.name}
          type={input.type}
          onChange={({ e }): void => input.onChange(e)}
          state={getFieldState(meta)}
          onBlur={input.onBlur}
          onFocus={input.onFocus}
        />
      )}
    />
  );
};
