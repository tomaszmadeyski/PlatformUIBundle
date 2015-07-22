<?php

/**
 * File containing the SectionListType class.
 *
 * @copyright Copyright (C) eZ Systems AS. All rights reserved.
 * @license For full copyright and license information view LICENSE file distributed with this source code.
 *
 * @version //autogentag//
 */

namespace EzSystems\PlatformUIBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use EzSystems\PlatformUIBundle\Helper\SectionHelperInterface;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Class SectionListType.
 */
class SectionListType extends AbstractType
{
    /**
     * @var \EzSystems\PlatformUIBundle\Helper\SectionHelperInterface
     */
    protected $sectionHelper;

    /**
     * @var \Symfony\Component\Translation\TranslatorInterface
     */
    private $translator;

    public function __construct(
        SectionHelperInterface $sectionHelper,
        TranslatorInterface $translator
    ) {
        $this->sectionHelper = $sectionHelper;
        $this->translator = $translator;
    }

    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $sectionList = $this->sectionHelper->getSectionList();

        $submitLabel = $this->translator->trans('section.remove.selected', [], 'section');

        $builder
            ->add('ids', 'choice', [
                'choices' => [$sectionList],
                'multiple' => true,
                'expanded' => true,
            ])
            ->add('delete', 'submit', ['label' => $submitLabel]);
    }

    public function getName()
    {
        return 'sectionlist';
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(
            ['data_class' => 'EzSystems\PlatformUIBundle\Entity\SectionList']
        );
    }
}
